import { and, asc, eq, isNull } from "drizzle-orm";

import { table_location_administrative_units } from "../../schemas/administrative-unit";
import { table_location_countries } from "../../schemas/country";
import { BaseModel } from "../BaseModel";

class LocationModel extends BaseModel<typeof table_location_countries> {
  constructor() {
    super(table_location_countries);
  }

  getLocationById = async (id: string) => {
    const location = await this.db
      .select()
      .from(this.table)
      .where(eq(this.table.id, id));
    return location[0];
  };

  /**
   * Get all active countries
   */
  getCountries = async () => {
    const countries = await this.db
      .select()
      .from(this.table)
      .where(eq(this.table.isActive, true))
      .orderBy(asc(this.table.code));
    return countries;
  };

  /**
   * Get country detail by ID
   */
  getCountryDetail = async (id: string) => {
    const country = await this.db
      .select()
      .from(this.table)
      .where(eq(this.table.id, id));
    return country[0];
  };

  /**
   * Get location tree (administrative units)
   * @param params - Optional parameters
   * @param params.parentId - Filter by parent ID (null for root level)
   * @param params.countryId - Filter by country ID
   * @param params.level - Filter by level (1, 2, or 3)
   */
  getLocationTree = async (params?: {
    parentId?: string | null;
    countryId?: string;
    level?: number;
  }) => {
    const conditions = [eq(table_location_administrative_units.isActive, true)];

    // Filter by parentId
    if (params?.parentId !== undefined) {
      if (params.parentId === null) {
        // Get root level (level 1, no parent)
        conditions.push(isNull(table_location_administrative_units.parentId));
      } else {
        conditions.push(
          eq(table_location_administrative_units.parentId, params.parentId)
        );
      }
    }

    // Filter by countryId
    if (params?.countryId) {
      conditions.push(
        eq(table_location_administrative_units.countryId, params.countryId)
      );
    }

    // Filter by level
    if (params?.level) {
      conditions.push(
        eq(table_location_administrative_units.level, params.level)
      );
    }

    const administrativeUnits = await this.db
      .select()
      .from(table_location_administrative_units)
      .where(and(...conditions))
      .orderBy(
        asc(table_location_administrative_units.level),
        asc(table_location_administrative_units.name)
      );

    return administrativeUnits;
  };

  /**
   * Get all children of a parent by parentId and type
   * @param params - Required parameters
   * @param params.parentId - Parent ID to get children from
   * @param params.type - Administrative unit type (province, state, district, ward, commune, etc.)
   */
  getLocationBy = async (params: { parentId: string; type: string }) => {

    const conditions = [
      eq(table_location_administrative_units.isActive, true),
      eq(table_location_administrative_units.parentId, params.parentId),
      eq(table_location_administrative_units.type, params.type),
    ];

    const administrativeUnits = await this.db
      .select()
      .from(table_location_administrative_units)
      .where(and(...conditions))
      .orderBy(asc(table_location_administrative_units.name));

    return administrativeUnits;
  };

  /**
   * Get location tree (administrative units) by country code
   * @param countryCode - Country code (e.g., "VN", "US", "UK")
   * @param params - Optional parameters
   * @param params.parentId - Filter by parent ID (null for root level)
   * @param params.level - Filter by level (1, 2, or 3)
   */
  getLocationByCountryCode = async (
    countryCode: string,
    params?: {
      parentId?: string | null;
      level?: number;
    }
  ) => {
    // First, get the country by code
    const country = await this.db
      .select()
      .from(table_location_countries)
      .where(eq(table_location_countries.code, countryCode))
      .limit(1);

    if (!country[0]) {
      return [];
    }

    const conditions = [
      eq(table_location_administrative_units.isActive, true),
      eq(table_location_administrative_units.countryId, country[0].id),
    ];

    // Filter by parentId
    if (params?.parentId !== undefined) {
      if (params.parentId === null) {
        // Get root level (level 1, no parent)
        conditions.push(isNull(table_location_administrative_units.parentId));
      } else {
        conditions.push(
          eq(table_location_administrative_units.parentId, params.parentId)
        );
      }
    }

    // Filter by level
    const level = params?.level ?? 1;
    conditions.push(eq(table_location_administrative_units.level, level));

    const administrativeUnits = await this.db
      .select()
      .from(table_location_administrative_units)
      .where(and(...conditions))
      .orderBy(
        asc(table_location_administrative_units.level),
        asc(table_location_administrative_units.name)
      );

    return administrativeUnits;
  };
}

export default LocationModel;
