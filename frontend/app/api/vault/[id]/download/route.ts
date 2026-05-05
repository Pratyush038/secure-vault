import { createSupabaseServer } from "@/lib/supabase/server";
import supabaseAdmin from "@/lib/supabase/admin";
import { decryptFileOnServer } from "@/lib/vault-crypto";

export async function GET(
  _request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const supabase = await createSupabaseServer();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return Response.json(
        { data: null, error: { message: "You must be logged in to download files." } },
        { status: 401 }
      );
    }

    const supabaseClient = supabaseAdmin();
    const { data: fileRecord, error: fileError } = await supabaseClient
      .from("encrypted_files")
      .select("id, original_filename, storage_path, encrypted_key, iv, salt, user_id")
      .eq("id", id)
      .eq("user_id", user.id)
      .single();

    if (fileError || !fileRecord) {
      return Response.json({ data: null, error: { message: "File not found." } }, { status: 404 });
    }

    const { data: blobData, error: downloadError } = await supabaseClient.storage
      .from("encrypted-files")
      .download(fileRecord.storage_path);

    if (downloadError || !blobData) {
      return Response.json(
        {
          data: null,
          error: { message: `Failed to download encrypted file: ${downloadError?.message || "Unknown error"}` },
        },
        { status: 500 }
      );
    }

    const decryptedData = await decryptFileOnServer(
      await blobData.arrayBuffer(),
      fileRecord.encrypted_key,
      fileRecord.iv,
      fileRecord.salt
    );

    return new Response(decryptedData, {
      headers: {
        "Content-Type": "application/octet-stream",
        "Content-Disposition": `attachment; filename="${fileRecord.original_filename}"`,
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unexpected server error.";
    return Response.json({ data: null, error: { message } }, { status: 500 });
  }
}