export type GraphTab = "system" | "database";
export type GraphMode = "global" | "local";
export type GraphStatus = "implemented" | "validated" | "framework" | "future";
export type GraphTone = "database" | "validated" | "research" | "reporting" | "framework" | "future";
export type GraphShape = "concept" | "table" | "view" | "check" | "output" | "group";

export type VerifiedValue = {
  label: string;
  value: string;
};

export type GraphNode = {
  id: string;
  label: string;
  category: string;
  group?: string;
  status: GraphStatus;
  tone: GraphTone;
  shape: GraphShape;
  description: string;
  related_route: string;
  source_reference: string;
  database_object?: string;
  verified_values?: VerifiedValue[];
  is_group?: boolean;
};

export type GraphEdge = {
  id: string;
  source: string;
  target: string;
  label: string;
  direction: "forward" | "bidirectional";
  relationship_type: "research" | "relational" | "calculation" | "reporting" | "validation" | "workflow" | "future-foundation" | "aggregate";
  aggregate_count?: number;
};

export type GraphGroup = {
  id: string;
  label: string;
  description: string;
  status: GraphStatus;
  tone: GraphTone;
  related_route: string;
  source_reference: string;
  default_expanded: boolean;
};

export type GraphDataset = {
  groups: GraphGroup[];
  system: { nodes: GraphNode[]; edges: GraphEdge[] };
  database: { nodes: GraphNode[]; edges: GraphEdge[] };
};

export type PositionedNode = GraphNode & { x: number; y: number };
