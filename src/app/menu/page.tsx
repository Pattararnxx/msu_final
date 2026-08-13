"use client";

import { useState } from "react";
import { ActionIcon, Button, Group, Modal, Tabs, Text, TextInput, Tooltip } from "@mantine/core";
import Icon from "@/component/icon/icon";
import DashboardSidebar from "@/component/dashboard-sidebar/dashboard-sidebar";
import SidebarShell from "@/component/sidebar/sidebar-shell";
import MenuCard from "@/component/menu-card/menu-card";
import MenuDetailPanel from "@/component/menu-detail-panel/menu-detail-panel";
import { useAppDispatch } from "@/lib/redux/hooks";
import { close as closeSidebar, open as openSidebar } from "@/lib/redux/features/sidebar-slice";
import { MOCK_MENU_ITEMS } from "@/lib/menu/mock-data";
import { getTopSellerIds } from "@/lib/menu/sales";
import { CATEGORY_META, FOOD_TYPES, type FoodType, type MenuItem } from "@/lib/menu/types";
import styles from "./page.module.scss";

// Computed once from the full 12-month mock sales history — see
// src/lib/menu/sales.ts. Doesn't need to react to in-session add/edit/delete
// since those never touch order history, only the menu catalogue.
const TOP_SELLER_IDS = new Set(getTopSellerIds(3));

export default function MenuDashboardPage() {
  const dispatch = useAppDispatch();
  const [menuItems, setMenuItems] = useState<MenuItem[]>(MOCK_MENU_ITEMS);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);
  const [createCategory, setCreateCategory] = useState<FoodType>("ข้าวต้ม");
  const [categoryFilter, setCategoryFilter] = useState<FoodType | "all">("all");
  const [search, setSearch] = useState("");
  const [deleteTarget, setDeleteTarget] = useState<MenuItem | null>(null);

  const selectedItem = selectedId ? (menuItems.find((m) => m.id === selectedId) ?? null) : null;

  const filtered = menuItems.filter((item) => {
    if (categoryFilter !== "all" && item.category !== categoryFilter) return false;
    if (search.trim() && !item.name.toLowerCase().includes(search.trim().toLowerCase())) return false;
    return true;
  });

  // The board topology follows the menu catalogue. Empty categories do not
  // take up board space, while an explicitly selected filter still keeps its
  // column visible so the empty state has a clear home.
  const boardCategories = categoryFilter === "all"
    ? FOOD_TYPES.filter((type) => menuItems.some((item) => item.category === type))
    : [categoryFilter];

  const openItem = (id: string) => {
    setCreating(false);
    setSelectedId(id);
    dispatch(openSidebar());
  };

  const openCreate = (category: FoodType = "ข้าวต้ม") => {
    setCreating(true);
    setCreateCategory(category);
    setSelectedId(null);
    dispatch(openSidebar());
  };

  const handleClosePanel = () => {
    dispatch(closeSidebar());
    setSelectedId(null);
    setCreating(false);
  };

  const handleSave = (item: MenuItem) => {
    setMenuItems((prev) => {
      const exists = prev.some((m) => m.id === item.id);
      return exists ? prev.map((m) => (m.id === item.id ? item : m)) : [item, ...prev];
    });
    setCreating(false);
    setSelectedId(item.id);
  };

  const handleConfirmDelete = () => {
    if (!deleteTarget) return;
    setMenuItems((prev) => prev.filter((m) => m.id !== deleteTarget.id));
    setDeleteTarget(null);
    handleClosePanel();
  };

  // Remounts the panel (resetting its internal edit/draft state) whenever
  // the target switches — the panel derives its initial draft from props
  // once via useState, so without this key, clicking a different card while
  // the panel stays open would keep showing the previous item's draft.
  const panelKey = creating ? `create-${createCategory}` : (selectedItem?.id ?? "none");

  return (
    <div className={styles.page}>
      <div className={styles.shell}>
        <DashboardSidebar />

        <SidebarShell
          sidebarTitle={creating ? "เพิ่มเมนูใหม่" : selectedItem?.name}
          sidebarContent={
            creating || selectedItem ? (
              <MenuDetailPanel
                key={panelKey}
                item={creating ? null : selectedItem}
                initialCategory={createCategory}
                isTopSeller={selectedItem ? TOP_SELLER_IDS.has(selectedItem.id) : false}
                onSave={handleSave}
                onRequestDelete={setDeleteTarget}
                onClose={handleClosePanel}
              />
            ) : null
          }
        >
          <main className={styles.content}>
            <div className={styles.breadcrumbs} aria-label="เส้นทางการนำทาง">
              <span>ร้านโจ๊กป้าแดง</span>
              <Icon src="/icon/regular/caret-right.svg" size={12} />
              <span className={styles.breadcrumbCurrent}>เมนูอาหาร</span>
            </div>

            <div className={styles.headingRow}>
              <div>
                <h1 className={styles.heading}>เมนูอาหาร</h1>
                <Text size="sm" className={styles.headingMeta}>
                  จัดการเมนู ราคา และตัวเลือกเสริมของร้าน
                </Text>
              </div>
              <Button
                leftSection={<Icon src="/icon/regular/plus.svg" size={16} />}
                color="dark"
                onClick={() => openCreate()}
              >
                เพิ่มเมนู
              </Button>
            </div>

            <div className={styles.boardToolbar}>
              <TextInput
                className={styles.search}
                placeholder="ค้นหาเมนู..."
                leftSection={<Icon src="/icon/regular/magnifying-glass.svg" size={16} />}
                value={search}
                onChange={(event) => setSearch(event.currentTarget.value)}
                aria-label="ค้นหาเมนู"
              />
              <Group gap={8} className={styles.toolbarMeta}>
                <span className={styles.toolbarLabel}>มุมมอง</span>
                <span className={styles.boardMode}>
                  <Icon src="/icon/regular/columns.svg" size={15} />
                  บอร์ด
                </span>
                <span className={styles.resultCount}>{filtered.length}/{menuItems.length}</span>
              </Group>
            </div>

            <Tabs
              className={styles.filterTabs}
              value={categoryFilter}
              onChange={(value) => setCategoryFilter((value as FoodType | "all") ?? "all")}
            >
              <Tabs.List>
                <Tabs.Tab value="all">ทั้งหมด</Tabs.Tab>
                {FOOD_TYPES.map((type) => (
                  <Tabs.Tab key={type} value={type}>
                    {type}
                  </Tabs.Tab>
                ))}
              </Tabs.List>
            </Tabs>

            <div className={styles.boardViewport}>
              <div
                className={styles.board}
                style={{
                  gridTemplateColumns: `repeat(${Math.max(boardCategories.length, 1)}, minmax(240px, 1fr))`,
                }}
              >
                {boardCategories.map((type) => {
                  const category = CATEGORY_META[type];
                  const columnItems = filtered.filter((item) => item.category === type);

                  return (
                    <section key={type} className={styles.column} data-color={category.color}>
                      <div className={styles.columnHeader}>
                        <div className={styles.columnHeading}>
                          <span className={styles.columnDot} aria-hidden="true" />
                          <span>{type}</span>
                          <span className={styles.columnCount}>{columnItems.length}</span>
                        </div>
                        <Tooltip label={`เพิ่มเมนูในหมวด${type}`} withArrow>
                          <ActionIcon
                            variant="subtle"
                            color="gray"
                            size="sm"
                            aria-label={`เพิ่มเมนูในหมวด${type}`}
                            onClick={() => openCreate(type)}
                          >
                            <Icon src="/icon/regular/plus.svg" size={16} />
                          </ActionIcon>
                        </Tooltip>
                      </div>

                      <div className={styles.columnBody}>
                        {columnItems.map((item) => (
                          <MenuCard
                            key={item.id}
                            item={item}
                            isSelected={selectedId === item.id}
                            isTopSeller={TOP_SELLER_IDS.has(item.id)}
                            onClick={() => openItem(item.id)}
                          />
                        ))}
                        {columnItems.length === 0 && (
                          <div className={styles.columnEmpty}>
                            {search.trim() || categoryFilter !== "all" ? "ไม่พบเมนูที่ตรงตัวกรอง" : "ยังไม่มีเมนูในหมวดนี้"}
                          </div>
                        )}
                        <Button
                          className={styles.addCard}
                          variant="subtle"
                          color="gray"
                          leftSection={<Icon src="/icon/regular/plus.svg" size={15} />}
                          onClick={() => openCreate(type)}
                        >
                          เพิ่มเมนู
                        </Button>
                      </div>
                    </section>
                  );
                })}
                {boardCategories.length === 0 && (
                  <div className={styles.boardEmpty}>ยังไม่มีเมนูในบอร์ด เพิ่มเมนูแรกของร้านได้เลย</div>
                )}
              </div>
            </div>
          </main>
        </SidebarShell>
      </div>

      <Modal opened={!!deleteTarget} onClose={() => setDeleteTarget(null)} title="ลบเมนู" centered>
        <Text size="sm">ลบเมนู &ldquo;{deleteTarget?.name}&rdquo; ใช่มั้ย ย้อนกลับไม่ได้</Text>
        <Group justify="flex-end" mt={16} gap={8}>
          <Button variant="default" onClick={() => setDeleteTarget(null)}>
            ยกเลิก
          </Button>
          <Button color="red" onClick={handleConfirmDelete}>
            ลบเมนู
          </Button>
        </Group>
      </Modal>
    </div>
  );
}
