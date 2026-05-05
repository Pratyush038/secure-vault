import SupaAuthVerifyEmail from "@/emails";
import supabaseAdmin from "@/lib/supabase/admin";

import { Resend } from "resend";

export async function POST(request: Request) {
	try {
		const data = await request.json();
		if (!data?.email || !data?.password) {
			return Response.json(
				{ data: null, error: { message: "Email and password are required." } },
				{ status: 400 }
			);
		}

		let supabase;
		try {
			supabase = supabaseAdmin();
		} catch {
			return Response.json(
				{
					data: null,
					error: {
						message:
							"Server auth is not configured. Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY.",
					},
				},
				{ status: 500 }
			);
		}

		const res = await supabase.auth.admin.generateLink({
			type: "signup",
			email: data.email,
			password: data.password,
		});

		if (res.error) {
			return Response.json({ data: null, error: res.error }, { status: 400 });
		}

		if (!res.data.properties?.email_otp) {
			return Response.json(
				{ data: null, error: { message: "Failed to generate verification OTP." } },
				{ status: 500 }
			);
		}

		const resendApiKey = process.env.RESEND_API_KEY || process.env.NEXT_PUBLIC_RESEND_API_KEY;
		const resendDomain = process.env.RESEND_DOMAIN || process.env.NEXT_PUBLIC_RESEND_DOMAIN;
		if (!resendApiKey || !resendDomain) {
			return Response.json(
				{ data: null, error: { message: "Email service is not configured." } },
				{ status: 500 }
			);
		}

		const resend = new Resend(resendApiKey);
		const resendRes = await resend.emails.send({
			from: `Secure Cloud File Vault <onboarding@${resendDomain}>`,
			to: [data.email],
			subject: "Secure Cloud File Vault - Verify Email",
			react: SupaAuthVerifyEmail({
				verificationCode: res.data.properties.email_otp,
			}),
		});

		if (resendRes.error) {
			return Response.json({ data: null, error: resendRes.error }, { status: 500 });
		}

		return Response.json({ data: resendRes.data, error: null });
	} catch (error) {
		const message = error instanceof Error ? error.message : "Unexpected server error.";
		return Response.json({ data: null, error: { message } }, { status: 500 });
	}
}
