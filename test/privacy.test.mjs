import test from "node:test";
import assert from "node:assert/strict";
import { MemoryDB } from "../build/db.js";

const makeProjectId = () =>
  `privacy-test-${Date.now()}-${Math.random().toString(16).slice(2, 8)}`;

test("private visibility is hidden by default in read paths", async () => {
  const db = new MemoryDB();
  await db.ready();

  const project = makeProjectId();
  const createdIds = [];

  try {
    const privateMemory = db.save({
      content: "private memory content",
      title: "private note",
      category: "testing",
      project,
      visibility: "private",
    });
    const internalMemory = db.save({
      content: "internal memory content",
      title: "internal note",
      category: "testing",
      project,
      visibility: "internal",
    });

    createdIds.push(privateMemory.id, internalMemory.id);

    const listDefault = db.list({ project, limit: 20, offset: 0 });
    assert.ok(listDefault.every((item) => item.visibility !== "private"));
    assert.ok(listDefault.some((item) => item.id === internalMemory.id));
    assert.ok(!listDefault.some((item) => item.id === privateMemory.id));

    const searchDefault = db.search({ query: "memory", project, limit: 20 });
    assert.ok(searchDefault.every((item) => item.visibility !== "private"));

    const timelineDefault = db.timeline({ project, limit: 20, offset: 0 });
    assert.ok(timelineDefault.every((item) => item.visibility !== "private"));

    const getDefault = db.get(privateMemory.id);
    assert.equal(getDefault, null);
  } finally {
    createdIds.forEach((id) => {
      db.delete(id);
    });
    db.close();
  }
});

test("include_private allows private retrieval and visibility filters work", async () => {
  const db = new MemoryDB();
  await db.ready();

  const project = makeProjectId();
  const createdIds = [];

  try {
    const privateMemory = db.save({
      content: "private retrieval memory",
      title: "private retrieval",
      category: "testing",
      project,
      visibility: "private",
    });
    const shareableMemory = db.save({
      content: "shareable retrieval memory",
      title: "shareable retrieval",
      category: "testing",
      project,
      visibility: "shareable",
    });

    createdIds.push(privateMemory.id, shareableMemory.id);

    const listWithPrivate = db.list({
      project,
      include_private: true,
      limit: 20,
      offset: 0,
    });
    assert.ok(listWithPrivate.some((item) => item.id === privateMemory.id));

    const getWithPrivate = db.get(privateMemory.id, true);
    assert.ok(getWithPrivate);
    assert.equal(getWithPrivate?.visibility, "private");

    const searchPrivateOnly = db.search({
      query: "retrieval",
      project,
      visibility: "private",
      include_private: true,
      limit: 20,
    });
    assert.equal(searchPrivateOnly.length, 1);
    assert.equal(searchPrivateOnly[0]?.id, privateMemory.id);

    const timelineShareableOnly = db.timeline({
      project,
      visibility: "shareable",
      include_private: true,
      limit: 20,
      offset: 0,
    });
    assert.equal(timelineShareableOnly.length, 1);
    assert.equal(timelineShareableOnly[0]?.id, shareableMemory.id);
  } finally {
    createdIds.forEach((id) => {
      db.delete(id);
    });
    db.close();
  }
});
