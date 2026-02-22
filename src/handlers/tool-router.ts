import type {
  GetMemoryInput,
  ListMemoriesInput,
  MemoryVisibility,
  MemoryToolName,
  SaveMemoryInput,
  SearchMemoriesInput,
  TimelineMemoriesInput,
  UpdateMemoryInput,
} from "../types.js";
import { MemoryDB } from "../db.js";
import {
  getObject,
  getOptionalBoolean,
  getOptionalEnum,
  getOptionalNumber,
  getOptionalString,
  getOptionalStringArray,
  getRequiredNumber,
  getRequiredString,
} from "../utils/validation.js";
import { fail, ok } from "../utils/tool-response.js";

const VISIBILITY_VALUES: readonly MemoryVisibility[] = [
  "private",
  "internal",
  "shareable",
];

export const handleToolCall = (
  db: MemoryDB,
  name: string,
  args: unknown
) => {
  const input = getObject(args);
  const tool = name as MemoryToolName;

  switch (tool) {
    case "save_memory": {
      const payload: SaveMemoryInput = {
        content: getRequiredString(input, "content"),
        title: getOptionalString(input, "title"),
        category: getOptionalString(input, "category"),
        tags: getOptionalStringArray(input, "tags"),
        project: getOptionalString(input, "project"),
        visibility: getOptionalEnum(input, "visibility", VISIBILITY_VALUES),
      };
      return ok(db.save(payload));
    }

    case "search_memories": {
      const payload: SearchMemoriesInput = {
        query: getRequiredString(input, "query"),
        category: getOptionalString(input, "category"),
        project: getOptionalString(input, "project"),
        visibility: getOptionalEnum(input, "visibility", VISIBILITY_VALUES),
        include_private: getOptionalBoolean(input, "include_private"),
        limit: getOptionalNumber(input, "limit"),
      };
      const memories = db.search(payload);
      return ok({ count: memories.length, memories });
    }

    case "list_memories": {
      const payload: ListMemoriesInput = {
        category: getOptionalString(input, "category"),
        project: getOptionalString(input, "project"),
        visibility: getOptionalEnum(input, "visibility", VISIBILITY_VALUES),
        include_private: getOptionalBoolean(input, "include_private"),
        limit: getOptionalNumber(input, "limit"),
        offset: getOptionalNumber(input, "offset"),
      };
      const memories = db.list(payload);
      return ok({ count: memories.length, memories });
    }

    case "timeline_memories": {
      const payload: TimelineMemoriesInput = {
        category: getOptionalString(input, "category"),
        project: getOptionalString(input, "project"),
        visibility: getOptionalEnum(input, "visibility", VISIBILITY_VALUES),
        include_private: getOptionalBoolean(input, "include_private"),
        from: getOptionalString(input, "from"),
        to: getOptionalString(input, "to"),
        limit: getOptionalNumber(input, "limit"),
        offset: getOptionalNumber(input, "offset"),
      };
      const memories = db.timeline(payload);
      return ok({ count: memories.length, memories });
    }

    case "get_memory": {
      const payload: GetMemoryInput = {
        id: getRequiredNumber(input, "id"),
        include_private: getOptionalBoolean(input, "include_private"),
      };
      const memory = db.get(payload.id, payload.include_private ?? false);
      if (!memory) {
        return fail(`Memory with id ${payload.id} not found`);
      }
      return ok(memory);
    }

    case "delete_memory": {
      const id = getRequiredNumber(input, "id");
      const removed = db.delete(id);
      if (!removed) {
        return fail(`Memory with id ${id} not found`);
      }
      return ok({ success: true, message: `Memory ${id} deleted` });
    }

    case "update_memory": {
      const payload: UpdateMemoryInput = {
        id: getRequiredNumber(input, "id"),
        content: getOptionalString(input, "content"),
        title: getOptionalString(input, "title"),
        category: getOptionalString(input, "category"),
        tags: getOptionalStringArray(input, "tags"),
        project: getOptionalString(input, "project"),
        visibility: getOptionalEnum(input, "visibility", VISIBILITY_VALUES),
      };
      const memory = db.update(payload);
      if (!memory) {
        return fail(`Memory with id ${payload.id} not found`);
      }
      return ok(memory);
    }

    default:
      return fail(`Unknown tool: ${name}`);
  }
};
