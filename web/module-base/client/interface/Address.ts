import { LocalizeText } from "./LocalizeText";

type LocalizeTextOrString = LocalizeText | string;
export type countryCode =
  | "VN"
  | "US"
  | "UK"
  | "CA"
  | "AU"
  | "NZ"
  | "SG"
  | "MY"
  | "ID"
  | "PH"
  | "TH"
  | "VN"
  | "US"
  | "UK"
  | "CA"
  | "AU"
  | "NZ"
  | "SG"
  | "MY"
  | "ID"
  | "PH"
  | "TH";
/**
 * Types of administrative units in address structure
 * Note: "country", "street", and "postal_code" are NOT included here because Address already has separate fields for them.
 * administrativeUnits should only contain administrative divisions within the country (level >= 1).
 *
 * For Vietnam - supports both old and new administrative structures:
 *
 * OLD STRUCTURE (3 levels - traditional):
 * Level 1: Tỉnh/Thành phố (Province)
 * Level 2: Quận (in thành phố) hoặc Huyện (in tỉnh) - "district"
 * Level 3: Phường (in quận) hoặc Xã/Thị trấn (in huyện) - "ward"/"commune"/"township"
 *
 * NEW STRUCTURE (2 levels - simplified):
 * Level 1: Tỉnh/Thành phố (Province)
 * Level 3: Phường/Xã (directly under Tỉnh/TP, no Quận/Huyện) - "ward"/"commune"/"township"
 *
 * Note: Level 2 (district) is optional - can be omitted in new structure
 */
export type AdministrativeUnitType =
  | "province"
  | "state"
  | "region"
  | "district"
  | "city"
  | "county"
  | "ward" // Phường (VN)
  | "commune" // Xã (VN)
  | "neighborhood"
  | "township"; // Thị trấn (VN)

/**
 * Mapping of administrative unit types to their default levels
 * Note: Level starts from 1 (province/state) because country, street, and postalCode are stored separately in Address.
 * Level 1 = province/state, Level 2 = district/city (optional), Level 3 = ward/commune/township.
 *
 * Vietnam mapping (supports both old and new structures):
 * Level 1:
 * - province = Tỉnh/Thành phố
 * Level 2 (OPTIONAL - only in old structure):
 * - district = Quận (in thành phố) hoặc Huyện (in tỉnh)
 * Level 3:
 * - ward (Phường) = level 3 (in quận - old, or directly in TP - new)
 * - commune (Xã) = level 3 (in huyện - old, or directly in tỉnh - new)
 * - township (Thị trấn) = level 3 (in huyện - old, or directly in tỉnh - new)
 */
export type AdministrativeUnitLevelMap = {
  province: 1;
  state: 1;
  region: 1;
  district: 2; // Quận (thành phố) hoặc Huyện (tỉnh) - VN
  city: 2;
  county: 2;
  ward: 3; // Phường (VN) - in quận
  commune: 3; // Xã (VN) - in huyện
  neighborhood: 3;
  township: 3; // Thị trấn (VN) - in huyện
};

/**
 * Get the default level for an administrative unit type
 */
export const getDefaultLevelForType = (
  type: AdministrativeUnitType,
): number => {
  const levelMap: AdministrativeUnitLevelMap = {
    province: 1,
    state: 1,
    region: 1,
    district: 2,
    city: 2,
    county: 2,
    ward: 3,
    commune: 3,
    neighborhood: 3,
    township: 3,
  };

  return levelMap[type];
};

/**
 * Administrative unit in address hierarchy with type-level constraint
 * The level must match the default level for the given type
 * Using discriminated union for better type safety
 *
 * Note: Country, street, and postalCode are NOT included here because Address already has separate fields for them.
 * administrativeUnits should only contain administrative divisions within the country (level >= 1).
 */
export type AdministrativeUnit =
  | {
      id: string;
      name: LocalizeTextOrString;
      type: "province" | "state" | "region" | "city";
      level: 1;
    }
  | {
      id: string;
      name: LocalizeTextOrString;
      type: "district" | "city" | "county" | "ward";
      level: 2;
    }
  | {
      id: string;
      name: LocalizeTextOrString;
      type: "ward" | "commune" | "neighborhood" | "township";
      level: 3;
    };

/**
 * Flexible Address structure supporting any number of administrative levels
 * Compatible with both Vietnam and international address formats
 */

export type Address = {
  /** Street address (số nhà, tên đường) */
  street: LocalizeTextOrString;

  /** Postal/ZIP code */
  postalCode: string;

  /** Country information */
  country: {
    id: string;
    name: LocalizeTextOrString;
    code: countryCode;
  };

  /**
   * Array of administrative units within the country - flexible number of levels
   * Note: Country, street, and postalCode are stored separately in their respective fields above, so they should NOT be included here.
   * Sorted by level (ascending): province/state (level 1) -> [district/city (level 2) - optional] -> ward/commune/township (level 3).
   *
   * Examples for Vietnam:
   *
   * OLD STRUCTURE (3 levels):
   * - Thành phố: [{type: 'province', level: 1}, {type: 'district', level: 2}, {type: 'ward', level: 3}]
   *   - district = Quận (in thành phố)
   *   - ward = Phường (in quận)
   * - Tỉnh: [{type: 'province', level: 1}, {type: 'district', level: 2}, {type: 'commune', level: 3}]
   *   - district = Huyện (in tỉnh)
   *   - commune = Xã (in huyện)
   *
   * NEW STRUCTURE (2 levels - simplified):
   * - Thành phố: [{type: 'province', level: 1}, {type: 'ward', level: 3}]
   *   - ward = Phường (trực thuộc TP, không có Quận)
   * - Tỉnh: [{type: 'province', level: 1}, {type: 'commune', level: 3}]
   *   - commune = Xã (trực thuộc tỉnh, không có Huyện)
   *
   * Other examples:
   * - USA: [{type: 'state', level: 1}, {type: 'city', level: 2}]
   */
  administrativeUnits: AdministrativeUnit[];

  /** Optional: Geographic coordinates */
  latitude?: number;
  longitude?: number;

  /** Optional: Pre-formatted address string */
  formattedAddress?: LocalizeTextOrString;
};
