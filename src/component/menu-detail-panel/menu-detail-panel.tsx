"use client";

import { useState } from "react";
import {
  ActionIcon,
  Badge,
  Button,
  Group,
  Image,
  NumberInput,
  Select,
  Stack,
  TagsInput,
  Text,
  TextInput,
} from "@mantine/core";
import Icon from "@/component/icon/icon";
import MenuSalesChart from "@/component/menu-sales-chart/menu-sales-chart";
import { formatCurrency } from "@/lib/expense/group-by-week";
import { CATEGORY_META, FOOD_TYPES, type FoodType, type MenuItem, type MenuOptionGroup } from "@/lib/menu/types";
import styles from "./menu-detail-panel.module.css";

interface MenuDetailPanelProps {
  /** null = creating a new menu item */
  item: MenuItem | null;
  initialCategory?: FoodType;
  isTopSeller?: boolean;
  onSave: (item: MenuItem) => void;
  onRequestDelete: (item: MenuItem) => void;
  onClose: () => void;
}

let localIdCounter = 0;
function nextLocalId(prefix: string): string {
  localIdCounter += 1;
  return `${prefix}-local-${localIdCounter}`;
}

function blankDraft(category: FoodType = "ข้าวต้ม"): MenuItem {
  return {
    id: nextLocalId("menu"),
    name: "",
    category,
    image: "/icon/regular/bowl-food.svg",
    price: 0,
    ingredients: [],
    optionGroups: [],
  };
}

function MenuImage({ src, size = 72 }: { src: string; size?: number }) {
  if (src.startsWith("blob:") || src.startsWith("data:")) {
    return <Image src={src} alt="" h={size} w={size} radius="sm" fit="cover" />;
  }
  return (
    <div className={styles.imageTile} style={{ height: size, width: size }}>
      <Icon src={src} size={size * 0.4} />
    </div>
  );
}

function OptionGroupsEditor({
  groups,
  onChange,
}: {
  groups: MenuOptionGroup[];
  onChange: (groups: MenuOptionGroup[]) => void;
}) {
  const updateGroup = (id: string, patch: Partial<MenuOptionGroup>) =>
    onChange(groups.map((g) => (g.id === id ? { ...g, ...patch } : g)));
  const removeGroup = (id: string) => onChange(groups.filter((g) => g.id !== id));
  const addGroup = () =>
    onChange([...groups, { id: nextLocalId("group"), label: "", selectionType: "single", choices: [] }]);

  const updateChoice = (groupId: string, choiceId: string, patch: Partial<MenuOptionGroup["choices"][number]>) =>
    onChange(
      groups.map((g) =>
        g.id === groupId
          ? { ...g, choices: g.choices.map((c) => (c.id === choiceId ? { ...c, ...patch } : c)) }
          : g,
      ),
    );
  const removeChoice = (groupId: string, choiceId: string) =>
    onChange(
      groups.map((g) => (g.id === groupId ? { ...g, choices: g.choices.filter((c) => c.id !== choiceId) } : g)),
    );
  const addChoice = (groupId: string) =>
    onChange(
      groups.map((g) =>
        g.id === groupId
          ? { ...g, choices: [...g.choices, { id: nextLocalId("choice"), label: "", priceDelta: 0 }] }
          : g,
      ),
    );

  return (
    <Stack gap={12}>
      {groups.map((group) => (
        <div key={group.id} className={styles.optionGroup}>
          <Group gap={8} wrap="nowrap">
            <TextInput
              placeholder="ชื่อกลุ่ม เช่น ขนาด"
              size="xs"
              value={group.label}
              onChange={(event) => updateGroup(group.id, { label: event.currentTarget.value })}
              style={{ flex: 1 }}
            />
            <Select
              size="xs"
              w={150}
              data={[
                { value: "single", label: "เลือกได้ 1 อัน" },
                { value: "multiple", label: "เลือกได้หลายอัน" },
              ]}
              value={group.selectionType}
              onChange={(value) => value && updateGroup(group.id, { selectionType: value as "single" | "multiple" })}
              checkIconPosition="right"
            />
            <ActionIcon variant="subtle" color="red" onClick={() => removeGroup(group.id)} aria-label="ลบกลุ่มออฟชั่น">
              <Icon src="/icon/regular/trash.svg" size={14} />
            </ActionIcon>
          </Group>

          <Stack gap={6} className={styles.choiceList}>
            {group.choices.map((choice) => (
              <Group key={choice.id} gap={8} wrap="nowrap">
                <TextInput
                  placeholder="ชื่อตัวเลือก เช่น แก้วใหญ่"
                  size="xs"
                  value={choice.label}
                  onChange={(event) => updateChoice(group.id, choice.id, { label: event.currentTarget.value })}
                  style={{ flex: 1 }}
                />
                <NumberInput
                  placeholder="ราคา"
                  size="xs"
                  w={90}
                  leftSection="+฿"
                  value={choice.priceDelta}
                  onChange={(value) =>
                    updateChoice(group.id, choice.id, { priceDelta: typeof value === "number" ? value : 0 })
                  }
                />
                <ActionIcon
                  variant="subtle"
                  color="red"
                  onClick={() => removeChoice(group.id, choice.id)}
                  aria-label="ลบตัวเลือก"
                >
                  <Icon src="/icon/regular/x.svg" size={14} />
                </ActionIcon>
              </Group>
            ))}
            <Button variant="subtle" size="xs" onClick={() => addChoice(group.id)}>
              + เพิ่มตัวเลือกย่อย
            </Button>
          </Stack>
        </div>
      ))}
      <Button variant="default" size="xs" onClick={addGroup}>
        + เพิ่มกลุ่มออฟชั่น
      </Button>
    </Stack>
  );
}

export default function MenuDetailPanel({
  item,
  initialCategory = "ข้าวต้ม",
  isTopSeller = false,
  onSave,
  onRequestDelete,
  onClose,
}: MenuDetailPanelProps) {
  const isCreating = item === null;
  const [editing, setEditing] = useState(isCreating);
  const [draft, setDraft] = useState<MenuItem>(() => item ?? blankDraft(initialCategory));

  const startEdit = () => {
    setDraft(item ?? blankDraft(initialCategory));
    setEditing(true);
  };

  const cancelEdit = () => {
    if (isCreating) {
      onClose();
      return;
    }
    setDraft(item);
    setEditing(false);
  };

  const handleImagePick = (file: File | null) => {
    if (!file) return;
    setDraft((prev) => ({ ...prev, image: URL.createObjectURL(file) }));
  };

  const canSave = draft.name.trim() !== "" && draft.price >= 0;

  const handleSave = () => {
    onSave(draft);
    setEditing(false);
  };

  if (editing) {
    return (
      <Stack gap={18} className={styles.panelContent}>
        <Group align="flex-start" gap={12} className={styles.editMedia}>
          <MenuImage src={draft.image} size={88} />
          <div>
            <Text size="sm" fw={700}>รูปภาพเมนู</Text>
            <Text size="xs" c="dimmed" mt={3}>ใช้รูปเล็กเพื่อให้บอร์ดอ่านง่าย</Text>
          </div>
        </Group>
        <Button component="label" variant="default" size="xs">
          เปลี่ยนรูป
          <input
            type="file"
            accept="image/*"
            hidden
            onChange={(event) => handleImagePick(event.target.files?.[0] ?? null)}
          />
        </Button>

        <TextInput
          label="ชื่อเมนู"
          withAsterisk
          value={draft.name}
          onChange={(event) => setDraft({ ...draft, name: event.currentTarget.value })}
        />

        <Select
          label="หมวดหมู่"
          data={FOOD_TYPES.map((type) => ({ value: type, label: type }))}
          value={draft.category}
          onChange={(value) => value && setDraft({ ...draft, category: value as FoodType })}
          checkIconPosition="right"
        />

        <NumberInput
          label="ราคา"
          withAsterisk
          leftSection="฿"
          min={0}
          value={draft.price}
          onChange={(value) => setDraft({ ...draft, price: typeof value === "number" ? value : 0 })}
        />

        <TagsInput
          label="ส่วนผสม"
          placeholder="พิมพ์แล้วกด Enter"
          value={draft.ingredients}
          onChange={(value) => setDraft({ ...draft, ingredients: value })}
        />

        <Stack gap={8}>
          <Text size="sm" fw={600}>
            ออฟชั่นเสริม
          </Text>
          <OptionGroupsEditor groups={draft.optionGroups} onChange={(groups) => setDraft({ ...draft, optionGroups: groups })} />
        </Stack>

        <Group gap={8} justify="flex-end" className={styles.footer}>
          <Button variant="default" onClick={cancelEdit}>
            ยกเลิก
          </Button>
          <Button variant="filled" color="dark" disabled={!canSave} onClick={handleSave}>
            บันทึก
          </Button>
        </Group>
      </Stack>
    );
  }

  const activeItem = item as MenuItem;
  const category = CATEGORY_META[activeItem.category];

  return (
    <Stack gap={18} className={styles.panelContent}>
      <Group align="flex-start" gap={12} className={styles.itemHero}>
        <MenuImage src={activeItem.image} size={72} />
        <div className={styles.heroCopy}>
          <Group gap={6} wrap="wrap">
            <Badge size="xs" variant="light" color={category.color} className={styles.categoryBadge}>
              {category.label}
            </Badge>
            {isTopSeller && (
              <Badge size="xs" variant="light" color="yellow">
                ขายดี
              </Badge>
            )}
          </Group>
          <Text component="h2" size="lg" fw={700} mt={7}>
            {activeItem.name}
          </Text>
          <Text size="md" fw={700} c="var(--b-800)" mt={2}>
            ฿{formatCurrency(activeItem.price)}
          </Text>
          <Text size="xs" c="dimmed" mt={5}>รหัส {activeItem.id}</Text>
        </div>
      </Group>

      <Stack gap={8} className={styles.detailSection}>
        <Text size="sm" fw={700}>
          ส่วนผสม
        </Text>
        {activeItem.ingredients.length === 0 ? (
          <Text size="sm" c="dimmed">
            ยังไม่ได้ระบุ
          </Text>
        ) : (
          <Group gap={6} wrap="wrap">
            {activeItem.ingredients.map((ingredient) => (
              <Badge key={ingredient} size="sm" variant="outline" color="gray" className={styles.ingredientBadge}>
                {ingredient}
              </Badge>
            ))}
          </Group>
        )}
      </Stack>

      <Stack gap={8} className={styles.detailSection}>
        <Text size="sm" fw={700}>
          ออฟชั่นเสริม
        </Text>
        {activeItem.optionGroups.length === 0 ? (
          <Text size="sm" c="dimmed">
            ไม่มีออฟชั่นเสริม
          </Text>
        ) : (
          activeItem.optionGroups.map((group) => (
            <div key={group.id} className={styles.optionGroupView}>
              <Text size="xs" fw={600} c="dimmed">
                {group.label} ({group.selectionType === "single" ? "เลือกได้ 1 อัน" : "เลือกได้หลายอัน"})
              </Text>
              <Stack gap={2}>
                {group.choices.map((choice) => (
                  <Group key={choice.id} justify="space-between" gap={8}>
                    <Text size="sm">{choice.label}</Text>
                    <Text size="sm" c="dimmed">
                      {choice.priceDelta > 0 ? `+฿${formatCurrency(choice.priceDelta)}` : "ฟรี"}
                    </Text>
                  </Group>
                ))}
              </Stack>
            </div>
          ))
        )}
      </Stack>

      <MenuSalesChart menuItemId={activeItem.id} />

      <Group gap={8} justify="flex-end" className={styles.footer}>
        <Button variant="subtle" color="red" onClick={() => onRequestDelete(activeItem)}>
          ลบเมนู
        </Button>
        <Button variant="filled" color="dark" onClick={startEdit}>
          แก้ไข
        </Button>
      </Group>
    </Stack>
  );
}
