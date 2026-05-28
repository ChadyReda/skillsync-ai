import { Html, Body, Container, Heading, Text } from "@react-email/components";

interface WelcomeEmailProps {
  email: string;
}

export default function WelcomeEmail({ email }: WelcomeEmailProps) {
  return (
    <Html>
      <Body>
        <Container>
          <Heading>Welcome to SkillSync</Heading>

          <Text>Thanks for joining with {email}</Text>
        </Container>
      </Body>
    </Html>
  );
}
