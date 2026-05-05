import { motion } from "framer-motion"
import { ArrowRight, Lock, Shield, Key } from "lucide-react"

const features = [
  {
    title: "AES-256-GCM Encryption",
    description: "Each file is encrypted with a unique random 256-bit AES key in Galois/Counter Mode (GCM). This authenticated encryption scheme provides both confidentiality and integrity — any modification to the ciphertext is detected and rejected via the authentication tag.",
    icon: Lock,
    gradient: "from-emerald-500 to-teal-500",
  },
  {
    title: "PBKDF2 Key Wrapping",
    description: "A server-managed secret is transformed into a wrapping key using PBKDF2 with 600,000 iterations of SHA-256. A random 128-bit salt ensures uniqueness per file and keeps the wrapped file key isolated from storage.",
    icon: Key,
    gradient: "from-blue-500 to-indigo-500",
  },
  {
    title: "AES-KW Key Wrapping",
    description: "The per-file AES key is wrapped (encrypted) using the PBKDF2-derived server secret via the AES Key Wrap algorithm (AES-KW). This standard approach separates the file encryption key from the file blob, enabling secure key management without storing raw keys.",
    icon: Shield,
    gradient: "from-violet-500 to-purple-500",
  },
]

export function FeatureDetails() {
  return (
    <section className="py-20 sm:py-24 lg:py-32">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center"
      >
        <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl lg:text-5xl">
          Cryptographic{" "}
          <span className="bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 bg-clip-text text-transparent">
            Deep Dive
          </span>
        </h2>
        <p className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-muted-foreground">
          Understanding the server-managed cryptographic architecture that protects your files from upload to download.
        </p>
      </motion.div>

      <div className="mt-16 grid grid-cols-1 gap-16 sm:gap-24">
        {features.map((feature, index) => (
          <motion.div
            key={feature.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
            className={`flex flex-col gap-8 lg:items-center ${
              index % 2 === 0 ? 'lg:flex-row' : 'lg:flex-row-reverse'
            }`}
          >
            {/* Text Content */}
            <div className="flex-1 space-y-4">
              <motion.div
                initial={{ opacity: 0, x: index % 2 === 0 ? -20 : 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
              >
                <h3 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
                  {feature.title}
                </h3>
                <p className="mt-4 text-lg leading-8 text-muted-foreground">
                  {feature.description}
                </p>
                <div className="mt-6">
                  <button className="group inline-flex items-center gap-2 text-sm font-semibold text-primary">
                    Learn more
                    <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
                  </button>
                </div>
              </motion.div>
            </div>

            {/* Visual */}
            <div className="flex-1">
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: 0.4 }}
                className="relative rounded-2xl bg-gradient-to-b from-muted/50 to-muted p-2 ring-1 ring-foreground/10 backdrop-blur-3xl dark:from-muted/30 dark:to-background/80"
              >
                <div className={`rounded-xl bg-gradient-to-br ${feature.gradient} p-8 sm:p-12 flex flex-col items-center justify-center min-h-[280px]`}>
                  <feature.icon className="w-16 h-16 text-white/90 mb-4" />
                  <h4 className="text-xl font-bold text-white text-center">{feature.title}</h4>
                  <p className="text-white/70 text-sm text-center mt-2 max-w-xs">
                    {index === 0 && "256-bit key • 96-bit IV • Authentication tag embedded"}
                    {index === 1 && "SHA-256 • 600K iterations • Random 128-bit salt per file"}
                    {index === 2 && "RFC 3394 • Server secret isolation • No raw key storage"}
                  </p>
                </div>
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-blue-500/20 via-transparent to-purple-500/20 opacity-0 transition-opacity duration-300 hover:opacity-100" />
              </motion.div>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  )
} 