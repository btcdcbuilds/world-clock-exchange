import { describe, expect, it } from "vitest";
import { searchTimezones } from "../lib/timezone-data";

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
