import { AlertSchema } from './AlertSchema';
import { EmailStationSchema } from './EmailStationSchema';
import { MeasureAverageSchema } from './MeasureAverageSchema';
import { MeasureSchema } from './MeasureSchema';
import { ParameterSchema } from './ParameterSchema';
import { StationSchema } from './StationSchema';
import { TypeAlertSchema } from './TypeAlertSchema';
import { TypeParameterSchema } from './TypeParameterSchema';
import { UserSchema } from './UserSchema';

export const schemas = [
  UserSchema,
  StationSchema,
  EmailStationSchema,
  TypeParameterSchema,
  ParameterSchema,
  MeasureSchema,
  MeasureAverageSchema,
  TypeAlertSchema,
  AlertSchema,
];

export {
  AlertSchema,
  EmailStationSchema,
  MeasureAverageSchema,
  MeasureSchema,
  ParameterSchema,
  StationSchema,
  TypeAlertSchema,
  TypeParameterSchema,
  UserSchema,
};
