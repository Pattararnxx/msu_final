"use client";

import { Button, Stack, Text } from "@mantine/core";
import SidebarShell from "@/component/sidebar/sidebar-shell";
import { useAppDispatch } from "@/lib/redux/hooks";
import { toggle } from "@/lib/redux/features/sidebar-slice";

// Just an example of "any component can be the sidebar content" — swap this
// for whatever the caller actually needs (a filter form, a detail view, ...).
function ExampleSidebarContent() {
  return (
    <Stack gap={12}>
      <Text size="sm" c="dimmed">
        เนื้อหานี้ถูกส่งเข้ามาทาง prop <code>sidebarContent</code> ของ
        SidebarShell — เปลี่ยนเป็น component ไหนก็ได้โดยไม่ต้องแก้ Sidebar เอง
      </Text>
      <Text size="sm" c="dimmed">
        สถานะเปิด/ปิดทั้งหมดถูกควบคุมผ่าน Redux (sidebar slice)
      </Text>
    </Stack>
  );
}

function TestPageContent() {
  const dispatch = useAppDispatch();

  return (
    <div style={{ padding: 40 }}>
      <Button onClick={() => dispatch(toggle())}>เปิด/ปิด Sidebar</Button>
    </div>
  );
}

const TestPage = () => {
  return (
    <SidebarShell
      sidebarTitle="ตัวอย่าง Sidebar"
      sidebarContent={<ExampleSidebarContent />}
    >
      <TestPageContent />
    </SidebarShell>
  );
};

export default TestPage;
