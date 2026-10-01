import { describe, expect, it } from "vitest";
import { searchTimezones, TIMEZONE_DATA, TIME_ZONE_ENTRIES, getTimezonesByRegion, getNamedTimeZones } from "../lib/timezone-data";

const cities = (query: string) => searchTimezones(query).map((tz) => tz.city);

describe("searchTimezones", () => {
  it("ignores accents in the query and the data", () => {
    expect(cities("Sao Paulo")).toContain("São Paulo");
    expect(cities("São Paulo")).toContain("São Paulo");
    expect(cities("bogota")).toContain("Bogotá");
  });

  it("matches the identifier with its underscores kept", () => {
    expect(cities("Sao_Paulo")).toContain("São Paulo");
    expect(cities("america/new_york")).toContain("New York");
  });

  it("does not list every city in the same time zone for a city name", () => {
    expect(cities("new york")).toEqual(["New York"]);
    expect(cities("los angeles")).toEqual(["Los Angeles"]);
  });

  it("is case-insensitive and still matches country and identifier", () => {
    expect(cities("LONDON")).toContain("London");
    expect(cities("japan")).toContain("Tokyo");
    expect(cities("Asia/Tokyo")).toContain("Tokyo");
  });

  it("returns nothing for an unknown place", () => {
    expect(searchTimezones("Atlantis")).toEqual([]);
  });
});

describe("time zones by short name", () => {
  it("finds both meanings of MST: Mountain Time and Arizona", () => {
    const found = cities("mst");
    expect(found[0]).toBe("Mountain Time");
    expect(found).toContain("Arizona Time");
  });

  it("finds both meanings of CST: US Central and China", () => {
    const found = cities("CST");
    expect(found).toContain("Central Time");
    expect(found).toContain("China Time");
  });

  it("finds Hong Kong Time for HKT and UTC for GMT", () => {
    expect(cities("hkt")[0]).toBe("Hong Kong Time");
    expect(cities("gmt")).toEqual(expect.arrayContaining(["UTC", "UK Time"]));
  });

  it("saves a time zone without its search-only short names", () => {
    const [mountain] = searchTimezones("MDT");
    expect(mountain).toEqual({
      city: "Mountain Time",
      country: "MST / MDT · US & Canada",
      timezone: "America/Denver",
      currency: "USD",
      utcOffset: "-07:00",
    });
  });

  it("lists every named time zone for the Time zones tab, without the cities", () => {
    expect(getNamedTimeZones().map((z) => z.city)).toEqual(TIME_ZONE_ENTRIES.map((z) => z.city));
    expect(Object.keys(getTimezonesByRegion())).not.toContain("Time zones");
  });
});

describe("city list", () => {
  it("has the newly added cities", () => {
    for (const name of ["Calgary", "Edmonton", "Oklahoma City", "Salt Lake City", "Abu Dhabi", "Macau", "Adelaide"]) {
      expect(cities(name)).toContain(name);
    }
  });

  it("uses a valid time zone for every city and time zone", () => {
    for (const tz of [...TIMEZONE_DATA, ...TIME_ZONE_ENTRIES]) {
      expect(() => new Intl.DateTimeFormat("en-US", { timeZone: tz.timezone }), tz.city).not.toThrow();
    }
  });

  it("has no city listed twice", () => {
    const names = TIMEZONE_DATA.map((tz) => `${tz.city}|${tz.country}`);
    expect(new Set(names).size).toBe(names.length);
  });

  it("puts every city in a region", () => {
    const regions = getTimezonesByRegion();
    const listed = Object.values(regions).reduce((n, list) => n + list.length, 0);
    expect(listed).toBe(TIMEZONE_DATA.length);
  });
});
