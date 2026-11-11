import { describe, expect, it } from "vitest";

import { fromDocument, toDocument } from "./document";

describe("toDocument", () => {
  it("is just the title when there is no body", () => {
    expect(toDocument({ title: "Ship it", props: {}, body: "" })).toBe(
      "Ship it",
    );
  });

  it("puts the body on the lines under the title", () => {
    expect(
      toDocument({
        title: "Ship it",
        props: {},
        body: "- [ ] build\n- [ ] test",
      }),
    ).toBe("Ship it\n- [ ] build\n- [ ] test");
  });

  it("puts the properties as frontmatter between title and body", () => {
    expect(
      toDocument({
        title: "Ship it",
        props: { Labels: ["Bug", "Urgent"], Due: "2026-11-14", Done: false },
        body: "notes",
      }),
    ).toBe(
      "Ship it\n---\nLabels:\n  - Bug\n  - Urgent\nDue: 2026-11-14\nDone: false\n---\nnotes",
    );
  });

  it("quotes text that would otherwise read as another type", () => {
    const text = toDocument({
      title: "T",
      props: { Version: "1.10", Flag: "true", Empty: "" },
      body: "",
    });
    expect(fromDocument(text).props).toEqual({
      Version: "1.10",
      Flag: "true",
      Empty: "",
    });
  });
});

describe("fromDocument", () => {
  it("takes the first line as the title and the rest as the body", () => {
    expect(fromDocument("Ship it\n- [ ] build\n- [ ] test")).toEqual({
      title: "Ship it",
      props: {},
      body: "- [ ] build\n- [ ] test",
    });
  });

  it("drops the blank lines under the title and trailing whitespace", () => {
    expect(fromDocument("Ship it\n\n\nnotes here\n\n")).toEqual({
      title: "Ship it",
      props: {},
      body: "notes here",
    });
  });

  it("keeps the indentation of the first body line", () => {
    expect(fromDocument("Snippet\n\n    code()")).toEqual({
      title: "Snippet",
      props: {},
      body: "    code()",
    });
  });

  it("gives an empty title and body for empty text", () => {
    expect(fromDocument("")).toEqual({ title: "", props: {}, body: "" });
  });

  it("reads the frontmatter under the title as properties", () => {
    expect(
      fromDocument(
        "Ship it\n---\nLabels: [Bug, Urgent]\nDue: 2026-11-14\nPoints: 3\nDone: true\nOwner:\n---\n\nnotes",
      ),
    ).toEqual({
      title: "Ship it",
      props: {
        Labels: ["Bug", "Urgent"],
        Due: "2026-11-14",
        Points: 3,
        Done: true,
        Owner: "",
      },
      body: "notes",
    });
  });

  it("leaves a block it cannot represent in the body", () => {
    const nested = "Ship it\n---\nOwner:\n  name: Fairy\n---\nnotes";
    expect(fromDocument(nested)).toEqual({
      title: "Ship it",
      props: {},
      body: "---\nOwner:\n  name: Fairy\n---\nnotes",
    });
  });

  it("leaves broken YAML and plain rules in the body", () => {
    expect(fromDocument("T\n---\na: [b\n---\nx").props).toEqual({});
    expect(fromDocument("T\n---\njust a line\n---\nx").props).toEqual({});
    expect(fromDocument("T\n---\n---\nx").body).toBe("---\n---\nx");
  });

  it("does not take frontmatter further down for properties", () => {
    expect(fromDocument("T\ntext\n---\na: 1\n---").props).toEqual({});
  });

  it("round-trips a card", () => {
    const card = {
      title: "Plan",
      props: { Labels: ["Bug"], Due: "2026-11-14T09:30", Points: 2.5 },
      body: "intro\n\n```mermaid\nA --> B\n```",
    };
    expect(fromDocument(toDocument(card))).toEqual(card);
  });
});
