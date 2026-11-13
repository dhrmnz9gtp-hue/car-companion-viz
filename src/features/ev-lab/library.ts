import type { ModelDefinition, VehicleModelBinding } from "./model";
import { pmsmModel } from "./models/pmsm";

export const modelLibrary: Readonly<Record<string, ModelDefinition>> = {
  [pmsmModel.id]: pmsmModel,
};

// No vehicle association is claimed until year, variant and technical sources are verified.
export const vehicleModelBindings: readonly VehicleModelBinding[] = [];
