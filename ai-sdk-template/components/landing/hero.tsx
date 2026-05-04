"use client"

import { ArrowRight, ArrowRightIcon } from "lucide-react"
import Link from "next/link"
import { BlurFade } from "@/components/magicui/blur-fade"
import { ShimmerButton } from "@/components/magicui/shimmer-button"
import { AnimatedShinyText } from "@/components/magicui/animated-shiny-text"
import { cn } from "@/lib/utils"
import { HiOutlineShieldCheck, HiOutlineLockClosed } from "react-icons/hi"

export function Hero() {
  return (
    <section className="py-20 sm:py-24 lg:py-32">
      <div className="group relative mx-auto flex justify-center">
        <BlurFade delay={0.25} inView>
          <Link
            href="/vault"
            className="group rounded-full border border-black/5 bg-neutral-100 text-base text-white transition-all ease-in hover:cursor-pointer hover:bg-neutral-200 dark:border-white/5 dark:bg-neutral-900 dark:hover:bg-neutral-800"
          >
            <AnimatedShinyText className="inline-flex items-center justify-center px-4 py-1 transition ease-out hover:text-neutral-600 hover:duration-300 hover:dark:text-neutral-400">
              <span>🔐 Server-Managed Encrypted Storage</span>
              <ArrowRightIcon className="ml-1 size-3 transition-transform duration-300 ease-in-out group-hover:translate-x-0.5" />
            </AnimatedShinyText>
          </Link>
        </BlurFade>
      </div>

      <div className="mt-10 text-center">
        <BlurFade delay={0.5} inView>
          <h1 className="mx-auto max-w-4xl text-4xl font-bold tracking-tight text-foreground sm:text-6xl lg:text-7xl">
            Secure Cloud{" "}
            <span className="bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 bg-clip-text text-transparent">
              File Vault
            </span>{" "}
            with Hybrid Cryptography
          </h1>
        </BlurFade>
        <BlurFade delay={0.75} inView>
          <p className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-muted-foreground sm:mt-8">
            Upload your files and the backend encrypts them before storage using AES-256-GCM.
            The UI shows the encryption state while the server handles the crypto.
          </p>
        </BlurFade>
      </div>

      <div className="mt-8 flex items-center justify-center gap-4 sm:mt-10">
        <BlurFade delay={1.0} inView>
          <Link href="/vault">
            <ShimmerButton
              className="flex items-center gap-2 px-6 py-3 text-base sm:text-lg"
              background="linear-gradient(to right, #10b981, #14b8a6)"
            >
              <span className="whitespace-pre-wrap text-center font-medium leading-none tracking-tight text-white">
                Open Vault
              </span>
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1 sm:w-5 sm:h-5" />
            </ShimmerButton>
          </Link>
        </BlurFade>
        <BlurFade delay={1.25} inView>
          <Link href="/signin">
            <div>
              <ShimmerButton
                className="flex items-center gap-2 px-6 py-3 text-base sm:text-lg"
                background="linear-gradient(to right, #334155, #0f172a)"
              >
                <span className="whitespace-pre-wrap text-center font-medium leading-none tracking-tight text-white">
                  Sign In
                </span>
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1 sm:w-5 sm:h-5" />
              </ShimmerButton>
            </div>
          </Link>
        </BlurFade>
      </div>

      {/* Security features preview */}
      <div className="relative mx-auto mt-16 sm:mt-20 lg:mt-24">
        <BlurFade delay={1.5} inView>
          <div className="relative rounded-2xl bg-gradient-to-b from-muted/50 to-muted p-6 ring-1 ring-foreground/10 backdrop-blur-3xl dark:from-muted/30 dark:to-background/80">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-center">
              <div className="space-y-2 p-4">
                <div className="mx-auto w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center">
                  <HiOutlineShieldCheck className="w-6 h-6 text-white" />
                </div>
                  <h3 className="font-semibold text-foreground">Server Managed</h3>
                  <p className="text-sm text-muted-foreground">Encryption happens on the backend before storage</p>
              </div>
              <div className="space-y-2 p-4">
                <div className="mx-auto w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center">
                  <HiOutlineLockClosed className="w-6 h-6 text-white" />
                </div>
                  <h3 className="font-semibold text-foreground">AES-256-GCM</h3>
                  <p className="text-sm text-muted-foreground">Authenticated encryption with integrity verification</p>
              </div>
              <div className="space-y-2 p-4">
                <div className="mx-auto w-12 h-12 rounded-xl bg-gradient-to-br from-violet-500 to-purple-500 flex items-center justify-center">
                  <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                  </svg>
                </div>
                <h3 className="font-semibold text-foreground">PBKDF2 Key Wrapping</h3>
                <p className="text-sm text-muted-foreground">600K iterations for server-side key wrapping</p>
              </div>
            </div>
          </div>
        </BlurFade>
      </div>
    </section>
  )
}