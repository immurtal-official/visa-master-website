"use client";

import { useRef, useState, useTransition } from "react";
import { useTranslations, type Locale } from "next-intl";
import type { RequiredDocument } from "@visa-master/core";
import { Button } from "@/components/ui/button";
import { Callout } from "@/components/ui/callout";
import { Card } from "@/components/ui/card";
import { createClient } from "@/lib/supabase/client";
import {
  ACCEPTED_TYPES,
  MAX_UPLOAD_BYTES,
  objectPath,
  uploadResumable,
} from "@/lib/uploads/resumable";
import { confirmUpload, removeUpload } from "./actions";

export interface UploadRow {
  id: string;
  document: string;
  page: number;
  original_name: string | null;
  status: "pending" | "stored" | "deleted";
}

type ItemState = "todo" | "uploading" | "pending" | "stored";

/**
 * One document on the checklist: what it is, why it is asked for, and its pages.
 *
 * The explanation is not decoration. Someone photographing a bank statement at
 * eleven at night wants to know why six months are needed before they go
 * looking for them, and a reason given up front is the difference between a
 * document that arrives right and one that arrives twice.
 */
export function DocumentItem({
  locale,
  applicationId,
  userId,
  document,
  uploads,
}: {
  locale: Locale;
  applicationId: string;
  userId: string;
  document: RequiredDocument;
  uploads: UploadRow[];
}) {
  const t = useTranslations("documents");
  const input = useRef<HTMLInputElement>(null);
  const [pending, startTransition] = useTransition();
  const [progress, setProgress] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  const stored = uploads.filter((upload) => upload.status === "stored");
  const state: ItemState =
    progress !== null
      ? "uploading"
      : stored.length > 0
        ? "stored"
        : uploads.length > 0
          ? "pending"
          : "todo";

  async function send(file: File): Promise<void> {
    setError(null);

    if (file.size > MAX_UPLOAD_BYTES) {
      setError(t("tooLarge"));
      return;
    }
    if (!(ACCEPTED_TYPES as readonly string[]).includes(file.type)) {
      setError(t("wrongType"));
      return;
    }

    const supabase = createClient();
    const { data } = await supabase.auth.getSession();
    const accessToken = data.session?.access_token;
    if (!accessToken) {
      setError(t("uploadFailed"));
      return;
    }

    const uploadId = crypto.randomUUID();
    const path = objectPath({ userId, applicationId, uploadId, fileName: file.name });
    const page = uploads.length + 1;

    // The row is written before the bytes move, so an interrupted upload leaves
    // something to find and resume rather than an orphaned object.
    const { error: rowError } = await supabase.from("uploads").insert({
      id: uploadId,
      application_id: applicationId,
      user_id: userId,
      document: document.id,
      page,
      storage_path: path,
      content_type: file.type,
      original_name: file.name,
    });

    if (rowError) {
      setError(t("uploadFailed"));
      return;
    }

    setProgress(0);

    try {
      await uploadResumable({
        file,
        path,
        accessToken,
        onProgress: ({ bytesSent, bytesTotal }) =>
          setProgress(bytesTotal > 0 ? Math.round((bytesSent / bytesTotal) * 100) : 0),
      });
    } catch {
      setProgress(null);
      setError(t("uploadFailed"));
      return;
    }

    setProgress(null);

    startTransition(async () => {
      const result = await confirmUpload(applicationId, uploadId, locale);
      if (!result.ok) setError(t("confirmFailed"));
    });
  }

  return (
    <Card padding="var(--space-5)">
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          alignItems: "baseline",
          justifyContent: "space-between",
          gap: "var(--space-3)",
        }}
      >
        <h2
          style={{
            margin: 0,
            fontSize: "var(--fs-18)",
            fontWeight: "var(--fw-semibold)",
            color: "var(--text-heading)",
          }}
        >
          {t(`item.${document.id}` as "item.passportBio")}
        </h2>

        <span style={{ display: "flex", gap: "var(--space-3)", fontSize: "var(--fs-14)" }}>
          <span style={{ color: "var(--text-faint)" }}>
            {t(`necessity.${document.necessity}` as "necessity.required")}
          </span>
          <span
            style={{
              color: state === "stored" ? "var(--status-success-fg)" : "var(--text-muted)",
              fontWeight: "var(--fw-medium)",
            }}
          >
            {t(`state.${state}` as "state.todo")}
          </span>
        </span>
      </div>

      <p
        style={{
          marginBlock: "var(--space-3) var(--space-4)",
          maxInlineSize: "var(--measure-prose)",
          fontSize: "var(--type-hint-size)",
          lineHeight: "var(--type-hint-lh)",
          color: "var(--text-muted)",
        }}
      >
        {t(`item.${document.id}Why` as "item.passportBioWhy")}
      </p>

      {error ? (
        <div style={{ marginBlockEnd: "var(--space-4)" }}>
          <Callout tone="error">{error}</Callout>
        </div>
      ) : null}

      {uploads.length > 0 ? (
        <ul
          style={{
            listStyle: "none",
            margin: "0 0 var(--space-4)",
            padding: 0,
            display: "grid",
            gap: "var(--space-2)",
          }}
        >
          {uploads.map((upload) => (
            <li
              key={upload.id}
              style={{
                display: "flex",
                flexWrap: "wrap",
                alignItems: "center",
                justifyContent: "space-between",
                gap: "var(--space-3)",
                padding: "var(--space-3) var(--space-4)",
                background: "var(--surface-sunken)",
                borderRadius: "var(--radius-control)",
              }}
            >
              <span style={{ minInlineSize: 0 }}>
                <span style={{ color: "var(--text-body)" }}>
                  {document.multiPage ? t("pageLabel", { page: upload.page }) : null}
                </span>{" "}
                {/* The applicant's own filename, which is theirs to recognise
                    the file by and the one thing here allowed to be truncated. */}
                <span
                  style={{
                    color: "var(--text-muted)",
                    fontSize: "var(--fs-14)",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                  }}
                >
                  {upload.original_name}
                </span>
              </span>

              <Button
                variant="quiet"
                size="sm"
                disabled={pending}
                onClick={() =>
                  startTransition(async () => {
                    await removeUpload(applicationId, upload.id, locale);
                  })
                }
              >
                {t("removeCta")}
              </Button>
            </li>
          ))}
        </ul>
      ) : null}

      {progress !== null ? (
        <p style={{ margin: 0, color: "var(--text-muted)" }}>
          {t("state.uploading")} · {progress}%
        </p>
      ) : (
        <>
          <input
            ref={input}
            type="file"
            // No capture attribute on purpose: the chooser then offers camera,
            // album and files, and a bank statement is usually already a
            // screenshot or an export sitting on the phone.
            accept={ACCEPTED_TYPES.join(",")}
            style={{ display: "none" }}
            onChange={(event) => {
              const file = event.target.files?.[0];
              event.target.value = "";
              if (file) void send(file);
            }}
          />
          <Button
            variant={state === "stored" ? "secondary" : "primary"}
            onClick={() => input.current?.click()}
            disabled={pending}
          >
            {uploads.length === 0
              ? t("addCta")
              : document.multiPage
                ? t("addPageCta")
                : t("replaceCta")}
          </Button>
        </>
      )}
    </Card>
  );
}
