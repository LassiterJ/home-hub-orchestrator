import { z } from "zod";

/** Basic enums */
export const RuntimeEnum = z.enum(["ts", "http", "process", "wasm"]);
export const EffectEnum  = z.enum(["pure", "effect"]);
export const EdgeType    = z.enum(["data", "control"]);

/** Port names are identifiers on a node. We keep types abstract for MVP. */
export const PortName = z.string().min(1).regex(/^[a-zA-Z_][\w.-]*$/);

/** Node instance placed on the canvas */
export const NodeInstanceSchema = z.object({
   id: z.string().min(1),
   kind: z.string().min(1),             // e.g., "FileIn", "YOLODetect_HTTP"
   version: z.string().default("1.0.0"),
   runtime: RuntimeEnum.default("ts"),
   effect: EffectEnum.default("pure"),
   /** config is validated later via node-specific zod; store raw here */
   config: z.record(z.unknown()).default({}),
   /** declared ports for wiring; UI uses these to validate edges */
   inputs: z.array(PortName).default([]),
   outputs: z.array(PortName).default([]),
   /** execution hints */
   concurrency: z.number().int().positive().optional(),
   stream: z.boolean().default(false),
   /** optional UI metadata */
   label: z.string().optional(),
   ui: z
      .object({
         x: z.number().optional(),
         y: z.number().optional(),
      })
      .partial()
      .optional(),
});

export type NodeInstance = z.infer<typeof NodeInstanceSchema>;

/** Edge between node ports */
export const EdgeSchema = z.object({
   id: z.string().min(1),
   type: EdgeType.default("data"),
   from: z.object({
      nodeId: z.string().min(1),
      port: PortName,
   }),
   to: z.object({
      nodeId: z.string().min(1),
      port: PortName,
   }),
});

export type Edge = z.infer<typeof EdgeSchema>;

/** Whole workflow */
export const WorkflowSchema = z.object({
   id: z.string().min(1),
   name: z.string().min(1),
   description: z.string().optional(),
   nodes: z.array(NodeInstanceSchema).min(1),
   edges: z.array(EdgeSchema).default([]),
   /** policy defaults; can be overridden per-edge later */
   queue: z
      .object({
         size: z.number().int().positive().default(64),
         policy: z.enum(["block", "drop-oldest", "drop-newest", "sample"]).default("block"),
      })
      .default({ size: 64, policy: "block" }),
   /** versioning for deterministic replay */
   manifestVersion: z.string().default("1"),
   createdAt: z.number().default(() => Date.now()),
   updatedAt: z.number().default(() => Date.now()),
});

export type Workflow = z.infer<typeof WorkflowSchema>;
