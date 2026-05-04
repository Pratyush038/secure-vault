import { createSupabaseServer } from "@/lib/supabase/server";
import supabaseAdmin from "@/lib/supabase/admin";
import { encryptFileOnServer } from "@/lib/vault-crypto";

export async function POST(request: Request) {
  try {
    const supabase = await createSupabaseServer();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return Response.json(
        { data: null, error: { message: "You must be logged in to upload files." } },
        { status: 401 }
      );
    }

    const formData = await request.formData();
    const file = formData.get("file");

    if (!(file instanceof File)) {
      return Response.json({ data: null, error: { message: "A file is required." } }, { status: 400 });
    }

    const supabaseClient = supabaseAdmin();
    const encryptedFile = await encryptFileOnServer(file);
    const storagePath = `${user.id}/${crypto.randomUUID()}`;

    const { error: storageError } = await supabaseClient.storage
      .from("encrypted-files")
      .upload(storagePath, encryptedFile.encryptedBlob, {
        contentType: "application/octet-stream",
        upsert: false,
      });

    if (storageError) {
      return Response.json(
        { data: null, error: { message: `Upload failed: ${storageError.message}` } },
        { status: 500 }
      );
    }

    const { error: dbError } = await supabaseClient.from("encrypted_files").insert({
      user_id: user.id,
      original_filename: file.name,
      storage_path: storagePath,
      encrypted_key: encryptedFile.encryptedKey,
      iv: encryptedFile.iv,
      salt: encryptedFile.salt,
      file_size: file.size,
    });

    if (dbError) {
      await supabaseClient.storage.from("encrypted-files").remove([storagePath]);
      return Response.json(
        { data: null, error: { message: `Failed to save file metadata: ${dbError.message}` } },
        { status: 500 }
      );
    }

    return Response.json({ data: { storagePath }, error: null });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unexpected server error.";
    return Response.json({ data: null, error: { message } }, { status: 500 });
  }
}