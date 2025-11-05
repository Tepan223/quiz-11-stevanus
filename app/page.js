import { Button } from "antd";

export default function Home() {
  return (
    <div style={{ padding: 24, textAlign: "center", marginTop: 100 }}>
      <h1 style={{ marginBottom: 24 }}>Welcome to the Student Management System</h1>
      <Button type="primary" href="/students">
        Go to Students Page
      </Button>
    </div>
  );
}
