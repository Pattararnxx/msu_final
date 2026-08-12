"use client";

import type { ReactNode } from "react";
import { useState } from "react";
import { Accordion as MantineAccordion } from "@mantine/core";
import Icon from "@/component/icon/icon";
import styles from "./accordion.module.css";

export interface AccordionItem {
  value: string;
  label: string;
  content: ReactNode;
  /** Optional icon rendered before the label */
  icon?: ReactNode;
  /** Disables interaction with this specific item */
  disabled?: boolean;
}

interface BaseAccordionProps {
  items: AccordionItem[];
  /** Size of the chevron icon in px */
  chevronIconSize?: number;
  /** Size of the clickable chevron hit-area in px */
  chevronSize?: number;
  /** Duration (ms) of the open/close panel transition */
  transitionDuration?: number;
  /** Disables the whole accordion */
  disabled?: boolean;
  /** Removes the icon rotation animation on toggle */
  disableChevronRotation?: boolean;
  /** Custom chevron icon path override */
  chevronIconSrc?: string;
  /** Called whenever the open value(s) change */
  onChange?: (value: string | string[] | null) => void;
}

interface SingleAccordionProps extends BaseAccordionProps {
  multiple?: false;
  /** Uncontrolled initial open item */
  defaultValue?: string | null;
  /** Controlled open item */
  value?: string | null;
}

interface MultipleAccordionProps extends BaseAccordionProps {
  multiple: true;
  /** Uncontrolled initial open items */
  defaultValue?: string[];
  /** Controlled open items */
  value?: string[];
}

type AccordionProps = SingleAccordionProps | MultipleAccordionProps;

// Minimal accordion: no boxed/filled item background, just an underline
// divider between rows (via Mantine's "default" variant) and an arrow-down
// icon swapped in for the built-in chevron — Mantine still handles the
// rotation on open since only the icon inside its chevron slot changes
// (unless disableChevronRotation is set).
export default function Accordion(props: AccordionProps) {
  const {
    items,
    multiple = false,
    chevronIconSize = 18,
    chevronSize = 25,
    transitionDuration = 200,
    disabled = false,
    disableChevronRotation = false,
    chevronIconSrc = "/icon/regular/caret-down.svg",
    onChange,
  } = props;

  // Internal state used only when the component is uncontrolled
  // (i.e. no `value` prop was passed in by the parent).
  const [internalValue, setInternalValue] = useState<string | string[] | null>(
    props.value !== undefined
      ? props.value
      : props.defaultValue !== undefined
        ? props.defaultValue
        : multiple
          ? []
          : null,
  );

  const isControlled = props.value !== undefined;
  const currentValue = isControlled ? props.value : internalValue;

  const handleChange = (next: string | string[] | null) => {
    if (!isControlled) {
      setInternalValue(next);
    }
    onChange?.(next);
  };

  const chevronClassName = disableChevronRotation
    ? `${styles.chevron} ${styles.chevronStatic}`
    : styles.chevron;

  const sharedProps = {
    variant: "default" as const,
    chevron: <Icon src={chevronIconSrc} size={chevronIconSize} />,
    chevronSize,
    transitionDuration,
    disabled,
    classNames: {
      root: styles.root,
      item: styles.item,
      control: styles.control,
      label: styles.label,
      chevron: chevronClassName,
      panel: styles.panel,
      content: styles.content,
    },
  };

  const renderItems = () =>
    items.map((item) => (
      <MantineAccordion.Item key={item.value} value={item.value}>
        <MantineAccordion.Control icon={item.icon} disabled={item.disabled}>
          {item.label}
        </MantineAccordion.Control>
        <MantineAccordion.Panel>{item.content}</MantineAccordion.Panel>
      </MantineAccordion.Item>
    ));

  if (multiple) {
    return (
      <MantineAccordion
        {...sharedProps}
        multiple
        value={currentValue as string[]}
        onChange={handleChange as (value: string[]) => void}
      >
        {renderItems()}
      </MantineAccordion>
    );
  }

  return (
    <MantineAccordion
      {...sharedProps}
      value={currentValue as string | null}
      onChange={handleChange as (value: string | null) => void}
    >
      {renderItems()}
    </MantineAccordion>
  );
}
