import { motion } from "framer-motion"
import { Lock, KeyRound, Upload, ShieldCheck, Download, FileCheck2 } from "lucide-react"

const flowSteps = [
  {
    title: "Select & Authenticate",
    description: "Sign in with your account. Your authentication is handled securely by Supabase Auth with session management.",
    icon: KeyRound,
    gradient: "from-sky-500 via-cyan-500 to-blue-500",
    shadowColor: "shadow-sky-500/25",
  },
  {
    title: "Choose File & Set Password",
    description: "Select a file to upload. The backend handles encryption and the UI only shows the progress state.",
    icon: Lock,
    gradient: "from-blue-500 via-indigo-500 to-violet-500",
    shadowColor: "shadow-blue-500/25",
  },
  {
    title: "Server-Side Encryption",
    description: "Your file is encrypted with a random AES-256-GCM key. The key is wrapped with a server-managed key using PBKDF2 + AES-KW.",
    icon: ShieldCheck,
    gradient: "from-emerald-500 via-teal-500 to-cyan-500",
    shadowColor: "shadow-emerald-500/25",
  },
  {
    title: "Encrypted Upload",
    description: "Only the encrypted blob is stored, while the wrapped key, IV, and salt are saved as metadata in the backend.",
    icon: Upload,
    gradient: "from-purple-500 via-violet-500 to-indigo-500",
    shadowColor: "shadow-purple-500/25",
  },
  {
    title: "Secure Download",
    description: "When downloading, the backend unwraps the file key and returns the decrypted file to the browser.",
    icon: Download,
    gradient: "from-orange-500 via-amber-500 to-yellow-500",
    shadowColor: "shadow-orange-500/25",
  },
  {
    title: "Integrity Verified",
    description: "AES-GCM automatically verifies the integrity via auth tags. Tampered files are rejected before download completes.",
    icon: FileCheck2,
    gradient: "from-rose-500 via-red-500 to-pink-500",
    shadowColor: "shadow-rose-500/25",
  },
]

export function SystemFlow() {
  return (
    <section className="py-20 sm:py-24 lg:py-32">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center"
      >
        <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl lg:text-5xl">
          How It{" "}
          <span className="bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 bg-clip-text text-transparent">
            Works
          </span>
        </h2>
        <p className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-muted-foreground">
          The complete server-managed encryption and download flow — from file selection to secure download.
        </p>
      </motion.div>

      <div className="mt-16 grid gap-8 lg:grid-cols-3">
        {flowSteps.map((step, index) => (
          <motion.div
            key={step.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
            className="relative group"
          >
            <div 
              className={`
                h-full rounded-2xl p-1 transition-all duration-300 
                bg-gradient-to-br ${step.gradient} opacity-75 hover:opacity-100
                hover:scale-[1.02] hover:-translate-y-1
              `}
            >
              <div className="h-full rounded-xl bg-background/90 p-6 backdrop-blur-xl">
                <div className={`
                  size-14 rounded-lg bg-gradient-to-br ${step.gradient}
                  flex items-center justify-center ${step.shadowColor}
                  shadow-lg transition-shadow duration-300 group-hover:shadow-xl
                `}>
                  <step.icon className="size-7 text-white" />
                </div>
                <h3 className="mt-4 text-xl font-semibold text-foreground">{step.title}</h3>
                <p className="mt-2 text-muted-foreground leading-relaxed">{step.description}</p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  )
}