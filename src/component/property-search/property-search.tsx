"use client";

import { useState, type CSSProperties } from "react";
import { TextInput, ActionIcon } from "@mantine/core";
import Icon from "@/component/icon/icon";
import styles from "./property-search.module.css";

// Right-hand half of the hero toolbar; PropertyFilter is the left-hand half.
export default function PropertySearch() {
  const [value, setValue] = useState("");

  return (
    <form
      className={styles.search}
      role="search"
      onSubmit={(event) => event.preventDefault()}
    >
      <TextInput
        value={value}
        onChange={(event) => setValue(event.currentTarget.value)}
        placeholder="ค้นหาทำเล โครงการ หรือรหัสทรัพย์"
        aria-label="ค้นหาอสังหาริมทรัพย์"
        radius={128}
        leftSection={<Icon src="/icon/regular/magnifying-glass.svg" size={16} />}
        classNames={{ root: styles.field, input: styles.input }}
      />
      <ActionIcon
        type="submit"
        radius={128}
        size={40}
        aria-label="ค้นหา"
        style={{ "--ai-bg": "var(--yellow)", "--ai-color": "var(--black)", "--ai-hover": "var(--primary-600)" } as CSSProperties}
      >
        <Icon src="/icon/regular/magnifying-glass.svg" size={16} />
      </ActionIcon>
    </form>
  );
}
