import {
  Body,
  Button,
  Container,
  Head,
  Hr,
  Html,
  Img,
  Preview,
  Section,
  Tailwind,
  Text,
} from "@react-email/components";

interface FileSharedProps {
  title: string;
  category: string;
  message: string;
  link: string;
  password: string;
}

export default function FileShared({
  title = "Rohan",
  category = "Contract",
  message = "this is test email dont reply please",
  link = "#",
  password = "123456",
}: FileSharedProps) {
  return (
    <Html>
      <Tailwind>
        <Head />
        <Preview>A file has been shared with you.</Preview>

        <Body className="bg-gradient-to-br from-indigo-50 via-white to-purple-50 py-12 font-sans">
          <Container className="mx-auto max-w-xl rounded-3xl border border-white/20 bg-white/80 p-0 shadow-2xl shadow-indigo-200/50 backdrop-blur-sm">
            {/* Gradient Header */}
            <Section className="rounded-t-3xl bg-gradient-to-r from-indigo-600 to-purple-600 px-8 py-10 text-center">
              <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-white/20 backdrop-blur-sm">
                <Text className="m-0 text-4xl">📁</Text>
              </div>
              <Text className="m-0 text-3xl font-bold text-white">
                File Shared
              </Text>
              <Text className="m-0 mt-2 text-sm text-indigo-100">
                Securely shared with you
              </Text>
            </Section>

            {/* Content */}
            <Section className="px-8 py-8">
              {/* Welcome Message */}
              <Text className="m-0 text-center text-base leading-relaxed text-slate-600">
                Someone has securely shared a file with you.
                <br />
                Use the button below to access it.
              </Text>

              {/* Message Card */}
              {message && (
                <Section className="mt-6 rounded-2xl border border-indigo-100 bg-gradient-to-br from-indigo-50/80 to-purple-50/80 p-5">
                  <div className="flex items-center gap-2">
                    <Text className="m-0 text-sm font-semibold uppercase tracking-wider text-indigo-600">
                      💬 Message from sender
                    </Text>
                    <div className="flex-1 border-t border-indigo-200/50" />
                  </div>
                  <Text className="m-0 mt-3 whitespace-pre-wrap text-sm leading-relaxed text-slate-700">
                    "{message}"
                  </Text>
                </Section>
              )}

              {/* File Details */}
              <Section className="mt-6 space-y-3">
                <div className="flex items-center justify-between rounded-2xl border border-slate-200/80 bg-slate-50/80 px-5 py-4 transition-all hover:border-indigo-200">
                  <div className="flex items-center gap-3">
                    <div className="rounded-lg bg-indigo-100 p-2">
                      <Text className="m-0 text-sm">📄</Text>
                    </div>
                    <div>
                      <Text className="m-0 text-xs font-medium uppercase tracking-wider text-slate-400">
                        File Name
                      </Text>
                      <Text className="m-0 font-semibold text-slate-800">
                        {title ?? "Untitled"}
                      </Text>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between rounded-2xl border border-slate-200/80 bg-slate-50/80 px-5 py-4 transition-all hover:border-purple-200">
                  <div className="flex items-center gap-3">
                    <div className="rounded-lg bg-purple-100 p-2">
                      <Text className="m-0 text-sm">🏷️</Text>
                    </div>
                    <div>
                      <Text className="m-0 text-xs font-medium uppercase tracking-wider text-slate-400">
                        Category
                      </Text>
                      <span className="inline-block rounded-full bg-gradient-to-r from-indigo-100 to-purple-100 px-3 py-0.5 text-sm font-semibold text-indigo-700">
                        {category ?? "Uncategorized"}
                      </span>
                    </div>
                  </div>
                </div>
              </Section>

              {/* CTA Button */}
              <Section className="my-8 text-center">
                <Button
                  href={link}
                  className="inline-block rounded-2xl bg-gradient-to-r from-indigo-600 to-purple-600 px-12 py-4 text-base font-semibold text-white shadow-lg shadow-indigo-500/30 transition-all hover:scale-105 hover:shadow-xl hover:shadow-indigo-500/40"
                >
                  🔓 Open Shared File
                </Button>
              </Section>

              {/* Divider */}
              <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-slate-200/60" />
                </div>
                <div className="relative flex justify-center">
                  <span className="bg-white px-4 text-xs text-slate-400">
                    SECURE ACCESS
                  </span>
                </div>
              </div>

              {/* Password Section */}
              <Section className="rounded-2xl border-2 border-dashed border-amber-200/60 bg-gradient-to-br from-amber-50/80 to-orange-50/80 p-6">
                <div className="flex items-center justify-center gap-2">
                  <Text className="m-0 text-sm font-semibold uppercase tracking-wider text-amber-600">
                    🔑 Access Password
                  </Text>
                </div>
                <div className="mt-3 rounded-xl bg-white/80 px-6 py-4 text-center shadow-inner">
                  <Text className="m-0 font-mono text-3xl font-extrabold tracking-[0.4em] text-slate-800">
                    {password}
                  </Text>
                </div>
                <Text className="m-0 mt-3 text-center text-xs text-amber-600/70">
                  Keep this password secure
                </Text>
              </Section>

              {/* Footer Note */}
              <Text className="mt-6 text-center text-xs leading-relaxed text-slate-400">
                If you weren't expecting this email, you can safely ignore it.
                <br />
                This is an automated email. Please do not reply.
              </Text>
            </Section>

            {/* Footer */}
            <Section className="rounded-b-3xl bg-slate-50/80 px-8 py-4">
              <Text className="m-0 text-center text-xs text-slate-400">
                © 2026 FileShare. All rights reserved.
              </Text>
            </Section>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
}