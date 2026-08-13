"use client";

import { Button, Group, Stack } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import Icon from "@/component/icon/icon";
import ExpenseUploadDrawer from "@/component/expense-upload-drawer/expense-upload-drawer";
import styles from "./expense-header.module.css";

interface ExpenseHeaderProps {
  businessName: string;
  phone: string;
}

// Business identity (left) + primary actions (right, two rows): upload/edit
// on top, export destinations below — matches the reference's action
// grouping. Edit + export actions are still non-functional placeholders;
// upload opens ExpenseUploadDrawer, a real right-side modal panel.
export default function ExpenseHeader({ businessName, phone }: ExpenseHeaderProps) {
  const [uploadOpened, { open: openUpload, close: closeUpload }] = useDisclosure(false);

  return (
    <div className={styles.header}>
      <Stack gap={2} className={styles.identity}>
        <h1 className={styles.name}>{businessName}</h1>
        <Group gap={6} className={styles.phone}>
          {phone}
        </Group>
      </Stack>

      <Stack gap={10} align="flex-end" className={styles.actions}>
        <Group gap={8} wrap="nowrap">
          <Button
            variant="filled"
            color="dark"
            radius="md"
            leftSection={<Icon src="/icon/regular/tray-arrow-up.svg" size={16} />}
            onClick={openUpload}
          >
            อัปโหลดบิล
          </Button>
          <Button
            variant="default"
            radius="md"
            leftSection={<Icon src="/icon/regular/pencil-simple.svg" size={16} />}
          >
            แก้ไขข้อมูล
          </Button>
        </Group>

        <Group gap={8} wrap="wrap" justify="flex-end">
          <Button
            variant="default"
            radius="md"
            size="xs"
            leftSection={<Icon src="/icon/regular/google-drive-logo.svg" size={14} />}
          >
            Google Drive
          </Button>
          <Button
            variant="default"
            radius="md"
            size="xs"
            leftSection={<Icon src="/icon/regular/table.svg" size={14} />}
          >
            Google Sheets
          </Button>
          <Button
            variant="default"
            radius="md"
            size="xs"
            leftSection={<Icon src="/icon/regular/file-xls.svg" size={14} />}
          >
            ดาวน์โหลดเป็นไฟล์ Excel
          </Button>
        </Group>
      </Stack>

      <ExpenseUploadDrawer opened={uploadOpened} onClose={closeUpload} />
    </div>
  );
}
