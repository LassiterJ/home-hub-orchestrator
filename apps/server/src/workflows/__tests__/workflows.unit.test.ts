import { describe, it, expect, beforeEach } from "vitest";
import { WorkflowSchema } from "workflows/schema";
import * as store from "workflows/store";

const sample = () => ({
   id: "yolo_draw_save",
   name: "YOLO → Draw → Save",
   description: "cv test",
   nodes: [
      { id: "fileIn",  kind: "FileIn",          version: "1.0.0", runtime: "ts",   effect: "pure",   config: {}, inputs: [],        outputs: ["out"], stream: false },
      { id: "detect",  kind: "YOLODetect_HTTP",  version: "1.0.0", runtime: "http", effect: "effect", config: {}, inputs: ["in"],    outputs: ["out"], stream: false },
      { id: "save",    kind: "FileOut",          version: "1.0.0", runtime: "ts",   effect: "effect", config: {}, inputs: ["in"],    outputs: [],      stream: false },
   ],
   edges: [
      { id: "e1", type: "data", from: { nodeId: "fileIn", port: "out" }, to: { nodeId: "detect", port: "in" } },
      { id: "e2", type: "data", from: { nodeId: "detect", port: "out" }, to: { nodeId: "save",   port: "in" } },
   ],
   queue: { size: 64, policy: "block" },
});

describe("WorkflowSchema", () => {
   it("accepts a valid workflow", () => {
      const wf = WorkflowSchema.parse(sample());
      expect(wf.id).toBe("yolo_draw_save");
   });

   it("rejects empty nodes", () => {
      const bad = { ...sample(), nodes: [] as any[] };
      expect(() => WorkflowSchema.parse(bad)).toThrow();
   });
});

describe("Memory store", () => {
   beforeEach(() => store.__reset());

   it("saves, lists, gets, deletes", async () => {
      const wf = WorkflowSchema.parse(sample());
      await store.save(wf);
      expect((await store.list()).length).toBe(1);
      expect((await store.get(wf.id))?.name).toContain("YOLO");
      await store.remove(wf.id);
      expect(await store.get(wf.id)).toBeUndefined();
   });
});
