"use client";

import { Box, Group, Stack, Text } from "@mantine/core";
import Icon from "@/component/icon/icon";
import type { MarketingUiBlock } from "@/lib/marketing/types";
import styles from "./chatbot.module.css";

interface MarketingUiBlocksProps {
  blocks: MarketingUiBlock[];
  onAsk?: (question: string) => void;
}

function formatBaht(value: number) {
  return `${value.toLocaleString("th-TH")} บาท`;
}

function BlockHeader({
  icon,
  eyebrow,
  title,
  meta,
}: {
  icon: string;
  eyebrow: string;
  title: string;
  meta: string;
}) {
  return (
    <Group className={styles.uiBlockHeader} gap={8} wrap="nowrap" align="flex-start">
      <span className={styles.uiBlockIcon} aria-hidden="true">
        <Icon src={icon} size={16} />
      </span>
      <Box className={styles.uiBlockHeading}>
        <Text component="span" className={styles.uiBlockEyebrow}>
          {eyebrow}
        </Text>
        <Text component="h3" className={styles.uiBlockTitle}>
          {title}
        </Text>
        <Text component="span" className={styles.uiBlockMeta}>
          {meta}
        </Text>
      </Box>
    </Group>
  );
}

function AskButton({ label, onAsk }: { label: string; onAsk?: () => void }) {
  if (!onAsk) return null;

  return (
    <button type="button" className={styles.uiActionButton} onClick={onAsk}>
      <span>{label}</span>
      <Icon src="/icon/regular/arrow-right.svg" size={15} />
    </button>
  );
}

function SalesInsightBlock({
  block,
  onAsk,
}: {
  block: Extract<MarketingUiBlock, { type: "sales_insight" }>;
  onAsk?: (question: string) => void;
}) {
  const topItems = block.items.slice(0, 3);
  const leadItem = topItems[0];

  return (
    <Box className={styles.uiBlock}>
      <BlockHeader
        icon="/icon/regular/chart-line-up.svg"
        eyebrow="SIGNAL FROM SALES"
        title={block.title}
        meta={`ข้อมูล ณ ${block.asOf}`}
      />
      <Stack className={styles.insightList} gap={0}>
        {topItems.map((item, index) => (
          <Group key={item.menuItemId} className={styles.insightRow} gap={9} wrap="nowrap">
            <span className={styles.insightRank}>{index + 1}</span>
            <Box className={styles.insightMain}>
              <Text component="span" className={styles.insightName}>
                {item.name}
              </Text>
              <Text component="span" className={styles.insightMeta}>
                {item.category} · {formatBaht(item.price)}
              </Text>
            </Box>
            <Box className={styles.insightMetric}>
              <Text component="strong">{item.quantitySold.toLocaleString("th-TH")}</Text>
              <Text component="span">ที่</Text>
            </Box>
          </Group>
        ))}
      </Stack>
      <Box className={styles.uiActionNote}>
        <Icon src="/icon/regular/lightbulb.svg" size={15} />
        <Text component="p">{block.recommendedAction}</Text>
      </Box>
      <Text component="p" className={styles.uiBlockNote}>
        {block.note}
      </Text>
      <AskButton
        label={leadItem ? `ร่างโพสต์จาก ${leadItem.name}` : "ร่างโพสต์จากเมนูขายดี"}
        onAsk={
          leadItem
            ? () => onAsk?.(`ช่วยร่างโพสต์สำหรับ ${leadItem.name} จากข้อมูลยอดขายนี้ให้หน่อย`)
            : undefined
        }
      />
    </Box>
  );
}

function MenuCatalogBlock({
  block,
  onAsk,
}: {
  block: Extract<MarketingUiBlock, { type: "menu_catalog" }>;
  onAsk?: (question: string) => void;
}) {
  const visibleItems = block.items.slice(0, 6);
  const bundleItems = block.items.slice(0, 2);

  return (
    <Box className={styles.uiBlock}>
      <BlockHeader
        icon="/icon/regular/bowl-food.svg"
        eyebrow="RESTAURANT CATALOGUE"
        title={block.title}
        meta={`${block.items.length} รายการ · อัปเดต ${block.asOf}`}
      />
      <Stack className={styles.catalogList} gap={0}>
        {visibleItems.map((item) => (
          <Group key={item.id} className={styles.catalogRow} gap={8} wrap="nowrap">
            <Box className={styles.catalogMain}>
              <Text component="span" className={styles.insightName}>
                {item.name}
              </Text>
              <Text component="span" className={styles.insightMeta}>
                {item.category}
              </Text>
            </Box>
            <Text component="strong" className={styles.catalogPrice}>
              {formatBaht(item.price)}
            </Text>
          </Group>
        ))}
      </Stack>
      {block.items.length > visibleItems.length && (
        <Text component="p" className={styles.uiBlockNote}>
          แสดง {visibleItems.length} จาก {block.items.length} รายการแรกเพื่อให้เลือกได้เร็วขึ้น
        </Text>
      )}
      <AskButton
        label="จัดชุดโปรจากเมนูนี้"
        onAsk={
          bundleItems.length >= 2
            ? () =>
                onAsk?.(
                  `ช่วยจัดชุดโปรจาก ${bundleItems.map((item) => item.name).join(" และ ")} โดยใช้ราคาในระบบและคำนวณเป็นร่างให้หน่อย`,
                )
            : undefined
        }
      />
    </Box>
  );
}

function BundleDraftBlock({
  block,
  onAsk,
}: {
  block: Extract<MarketingUiBlock, { type: "bundle_draft" }>;
  onAsk?: (question: string) => void;
}) {
  return (
    <Box className={styles.uiBlock}>
      <BlockHeader
        icon="/icon/regular/tag.svg"
        eyebrow="DRAFT OFFER"
        title={block.title}
        meta={`คำนวณจากราคาในระบบ ณ ${block.asOf}`}
      />
      <Stack className={styles.bundleItems} gap={0}>
        {block.items.map((item) => (
          <Group key={item.id} className={styles.catalogRow} gap={8} wrap="nowrap">
            <Text component="span" className={styles.insightName}>
              {item.name}
            </Text>
            <Text component="span" className={styles.catalogPrice}>
              {formatBaht(item.price)}
            </Text>
          </Group>
        ))}
      </Stack>
      <Box className={styles.bundlePrice}>
        <Text component="span" className={styles.bundlePriceLabel}>
          ราคาเสนอในร่าง
        </Text>
        <Text component="strong" className={styles.bundlePriceValue}>
          {formatBaht(block.proposedPrice)}
        </Text>
        <Text component="span" className={styles.bundleCompare}>
          จาก {formatBaht(block.regularPrice)} · ลด {block.discountPercent}% ({formatBaht(block.discountAmount)})
        </Text>
      </Box>
      <Box className={styles.uiActionNote}>
        <Icon src="/icon/regular/clipboard-text.svg" size={15} />
        <Text component="p">{block.status}</Text>
      </Box>
      <AskButton
        label="ปรับร่างชุดโปรนี้"
        onAsk={() =>
          onAsk?.(
            `ช่วยปรับร่างชุดโปร ${block.items.map((item) => item.name).join(" และ ")} ให้เหมาะกับการเพิ่มยอดต่อบิล โดยยังอ้างอิงราคาในระบบ`,
          )
        }
      />
    </Box>
  );
}

export default function MarketingUiBlocks({ blocks, onAsk }: MarketingUiBlocksProps) {
  if (blocks.length === 0) return null;

  return (
    <Stack className={styles.uiBlocks} gap={10} role="region" aria-label="ข้อมูลประกอบคำแนะนำการตลาด">
      {blocks.map((block, index) => {
        const key = `${block.type}-${index}`;
        if (block.type === "sales_insight") {
          return <SalesInsightBlock key={key} block={block} onAsk={onAsk} />;
        }
        if (block.type === "menu_catalog") {
          return <MenuCatalogBlock key={key} block={block} onAsk={onAsk} />;
        }
        return <BundleDraftBlock key={key} block={block} onAsk={onAsk} />;
      })}
    </Stack>
  );
}
