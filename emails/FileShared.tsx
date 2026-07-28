import {
  Body,
  Button,
  Container,
  Head,
  Hr,
  Html,
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
  title,
  category,
  message,
  link,
  password,
}: FileSharedProps) {
  return (
    <Html>
      <Tailwind>
        <Head />
        <Preview>A file has been shared with you.</Preview>

        <Body className="bg-slate-100 py-10 font-sans">
          <Container className="mx-auto max-w-xl rounded-xl border border-slate-200 bg-white p-10 shadow-sm">
            <Section>
              <Text className="m-0 text-3xl font-bold text-slate-900">
                📁 File Shared
              </Text>

              <Text className="mt-4 text-base leading-7 text-slate-600">
                Someone has securely shared a file with you. Use the button
                below to access it.
              </Text>
            </Section>

            {message && (
              <Section className="mt-8 rounded-lg border border-blue-200 bg-blue-50 p-5">
                <Text className="m-0 mb-2 text-sm font-semibold uppercase tracking-wide text-blue-700">
                  Message
                </Text>

                <Text className="m-0 whitespace-pre-wrap text-slate-700">
                  {message}
                </Text>
              </Section>
            )}

            <Hr className="my-8 border-slate-200" />

            <Section className="space-y-3">
              <Text className="m-0">
                <span className="font-semibold text-slate-900">File:</span>{" "}
                <span className="text-slate-700">{title}</span>
              </Text>

              <Text className="m-0">
                <span className="font-semibold text-slate-900">Category:</span>{" "}
                <span className="inline-block rounded-full bg-slate-100 px-3 py-1 text-sm text-slate-700">
                  {category}
                </span>
              </Text>
            </Section>

            <Section className="my-10 text-center">
              <Button
                href={link}
                className="rounded-lg bg-slate-900 px-8 py-4 text-base font-semibold text-white no-underline"
              >
                Open Shared File
              </Button>
            </Section>

            <Section className="rounded-lg border border-amber-200 bg-amber-50 p-5">
              <Text className="m-0 mb-3 text-sm font-semibold uppercase tracking-wide text-amber-700">
                Access Password
              </Text>

              <Text className="m-0 rounded-md bg-white px-4 py-3 text-center font-mono text-2xl font-bold tracking-[0.3em] text-slate-900">
                {password}
              </Text>
            </Section>

            <Text className="mt-8 text-sm leading-6 text-slate-500">
              Keep this password secure. You'll need it to access the shared
              file. If you weren't expecting this email, you can safely ignore
              it.
            </Text>

            <Hr className="my-8 border-slate-200" />

            <Text className="text-center text-xs text-slate-400">
              This is an automated email. Please do not reply.
            </Text>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
}
