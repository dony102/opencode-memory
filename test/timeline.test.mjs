import test from "node:test";
import assert from "node:assert/strict";
import { MemoryDB } from "../build/db.js";

const makeProjectId = () => `timeline-test-${Date.now()}-${Math.random().toString(16).slice(2, 8)}`;

test("timeline_memories supports pagination and deterministic ordering", async () => {
  const db = new MemoryDB();
  await db.ready();

  const project = makeProjectId();
  const createdIds = [];

  try {
    const first = db.save({
      content: "first timeline entry",
      title: "first",
      category: "testing",
      project,
      tags: ["timeline"],
    });
    const second = db.save({
      content: "second timeline entry",
      title: "second",
      category: "testing",
      project,
      tags: ["timeline"],
    });
    const third = db.save({
      content: "third timeline entry",
      title: "third",
      category: "testing",
      project,
      tags: ["timeline"],
    });

    createdIds.push(first.id, second.id, third.id);

    const full = db.timeline({ project, limit: 10, offset: 0 });
    assert.equal(full.length, 3);
    assert.deepEqual(
      full.map((item) => item.id),
      [...createdIds].sort((a, b) => a - b)
    );

    const paged = db.timeline({ project, limit: 2, offset: 1 });
    assert.equal(paged.length, 2);
    assert.deepEqual(
      paged.map((item) => item.id),
      [...createdIds].sort((a, b) => a - b).slice(1)
    );
  } finally {
    createdIds.forEach((id) => {
      db.delete(id);
    });
    db.close();
  }
});

test("timeline_memories applies date boundaries inclusively", async () => {
  const db = new MemoryDB();
  await db.ready();

  const project = makeProjectId();
  const createdIds = [];

  try {
    const memory = db.save({
      content: "boundary check",
      title: "boundary",
      category: "testing",
      project,
      tags: ["timeline", "boundary"],
    });
    createdIds.push(memory.id);

    const exact = db.timeline({
      project,
      from: memory.created_at,
      to: memory.created_at,
      limit: 10,
      offset: 0,
    });

    assert.ok(exact.some((item) => item.id === memory.id));

    const futureOnly = db.timeline({
      project,
      from: "2099-01-01 00:00:00",
      limit: 10,
      offset: 0,
    });

    assert.equal(futureOnly.length, 0);
  } finally {
    createdIds.forEach((id) => {
      db.delete(id);
    });
    db.close();
  }
});
