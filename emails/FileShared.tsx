import { Html, Head, Body, Container, Text, Button, Section } from "@react-email/components";

interface FileSharedProps {
    title: string;
    category: string;
    message: string;
    link: string;
    password: string;
}
export default function FileShared({ title, category, message, link, password } : FileSharedProps) {
  return (
    <Html>
      <Head />
      <Body style={{ fontFamily: "sans-serif" }}>
        <Container>
          {message && <Text>{message}</Text>}
          <Text>
            <strong>{title}</strong> ({category}) was shared with you.
          </Text>
          <Button href={link} style={{ background: "#111827", color: "#fff", padding: "10px 20px" }}>
            Open file
          </Button>
          <Text>Password: <strong>{password}</strong></Text>
        </Container>
      </Body>
    </Html>
  );
}