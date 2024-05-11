import { select, scaleSequential, contourDensity, geoPath, interpolateInferno, selectAll, interpolateRgb, interpolateHclLong, type ScaleSequential, type ContourMultiPolygon, interpolateCool } from 'd3';
import proj4 from 'proj4';
import { csv } from 'd3-fetch';

export enum HeatmapType {
    Windmap = "windmap",
    Solarmap = "solarmap",
}

interface HeatmapStyle {
    colorInterpolator: (t: number) => string;
    opacity: number;
    display: 'inline' | 'none';
}

export interface DataPoint {
    latitude: number;
    longitude: number;
    value: number;
}

interface SVGDimensions {
    width: number;
    height: number;
}

interface SVGCoordinate {
    x: number;
    y: number;
}

export async function fetchCSVData(csv_path: string): Promise<DataPoint[]> {
    try {
        const data: DataPoint[] = await csv(csv_path, (d: any) => ({
            latitude: +d.latitude,
            longitude: +d.longitude,
            value: +d.value
        }));
        return data;
    } catch (error) {
        console.error('Error fetching or parsing CSV data:', error);
        return [];
    }
}

// Using proj4js to project geographical coordinates using Robinson projection. 
// There's a lot of hard coding as the SVG we use does not include Antarctica and because the map is a variation of a normal Robinson projection. 
const wgs84 = 'EPSG:4326'; // Output
const robinson = '+proj=robin +lon_0=0 +x_0=0 +y_0=0 +datum=WGS84 +units=m +no_defs';  // Robinson projection string

function convertCoordinates(lat: number, lon: number, svgDimensions: SVGDimensions): SVGCoordinate {
    const { width, height } = svgDimensions;

    // I have adjusted the degrees below to fit our map, normal maps have longitude(-180, 180) and latitude(-90, 90) for reference
    const minY = proj4(wgs84, robinson, [0, -56.5])[1];
    const maxY = proj4(wgs84, robinson, [0, 85])[1];
    const minX = proj4(wgs84, robinson, [-173, 0])[0];
    const maxX = proj4(wgs84, robinson, [178, 0])[0];

    // Transform coordinates
    let [x, y] = proj4(wgs84, robinson, [lon, lat]);

    // Adapting to the SVG
    const effectiveWidth = maxX - minX;
    const effectiveHeight = maxY - minY;
    const xScale = width / effectiveWidth;
    const yScale = height / effectiveHeight;

    x = (x - minX) * xScale;
    y = height - ((y - minY) * yScale);  // Y-axis points down, have to adjust

    return { x, y };
}

// Config for each type of heatmap, could probably be more object oriented but this feels appropriate seeing we will only have 2 types of maps.
function getStyleConfig(heatmapType: HeatmapType): HeatmapStyle {
    switch (heatmapType) {
        case HeatmapType.Windmap:
            return {
                colorInterpolator: interpolateCool,
                opacity: 0.5,
                display: 'none',
            };
        case HeatmapType.Solarmap:
            return {
                colorInterpolator: interpolateHclLong("yellow", "red"),
                opacity: 0.15,
                display: 'inline',
            };
        default:
            return {
                colorInterpolator: interpolateInferno,
                opacity: 0.15,
                display: 'inline',
            };
    }
}

// I use the D3 library to render a contour density map according to the radiation level.
export async function renderHeatmap(svgElement: SVGSVGElement, data: DataPoint[], heatmapType: HeatmapType): Promise<void> {
    const svgDimensions: SVGDimensions = { width: svgElement.viewBox.baseVal.width, height: svgElement.viewBox.baseVal.height };
    const styleConfig = getStyleConfig(heatmapType);
    createClipPath(svgElement);
    const contours = calculateContours(data, svgDimensions);
    const colorScale = setupColorScale(contours, styleConfig);
    renderContours(svgElement, contours, colorScale, styleConfig, heatmapType);
}

// Basically ensures that contours stay within each country's border
function createClipPath(svgElement: SVGSVGElement): void {
    const defs = select(svgElement).append('defs');
    const clipPath = defs.append('clipPath').attr('id', 'heatmap-clip');

    // This has an error in TS, but I have no idea how to fix it. D3 is primarily made for JS, so that might be the problem.
    selectAll('g.country').each(function () {
        const paths = select(this).selectAll('path');
        paths.each(function () {
            clipPath.append(() => select(this).node().cloneNode(true));
        });
    });
}

function calculateContours(data: DataPoint[], svgDimensions: SVGDimensions): ContourMultiPolygon[] {
    // Generate the contours based on the geographical coordinates converted to SVG coordinates.
    return contourDensity<DataPoint>()
        .x(d => convertCoordinates(d.latitude, d.longitude, svgDimensions).x)
        .y(d => convertCoordinates(d.latitude, d.longitude, svgDimensions).y)
        .weight(d => d.value)
        .size([svgDimensions.width, svgDimensions.height])
        .bandwidth(20)
        .thresholds(40)
        (data);
}

function setupColorScale(contours: d3.ContourMultiPolygon[], styleConfig: HeatmapStyle): ScaleSequential<string, never> {
    // Select the greatest value for each contour and interpolate color scale.
    const maxContourValue = Math.max(...contours.map(c => c.value));
    return scaleSequential(styleConfig.colorInterpolator).domain([0, maxContourValue]);
}

function renderContours(svgElement: SVGSVGElement, contours: ContourMultiPolygon[], colorScale: ScaleSequential<string, never>, styleConfig: HeatmapStyle, heatmapType: HeatmapType): void {
    // This ensures that the contours stay within each country's borders, clip paths were from the earlier method.
    const heatmapGroup = select(svgElement).append('g')
        .attr('id', heatmapType)
        .attr('clip-path', 'url(#heatmap-clip)')
        .attr('display', styleConfig.display);

    // This renders the contours for each country
    heatmapGroup.selectAll('path')
        .data(contours)
        .enter().append('path')
        .attr('d', geoPath())
        .attr('fill', d => colorScale(d.value))
        .attr('pointer-events', 'none')
        .style('opacity', styleConfig.opacity);
}