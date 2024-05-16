import { select, scaleSequential, contourDensity, geoPath, interpolateInferno, selectAll, interpolateHclLong, type ScaleSequential, type ContourMultiPolygon, interpolateCool, axisBottom, scaleLinear, scaleBand, format, quantile, range, interpolateRound, quantize, interpolate, create, map } from 'd3';
import proj4 from 'proj4';
import { csv } from 'd3-fetch';

export enum HeatmapType {
    Windmap = "Windmap",
    Solarmap = "Solarmap",
}

interface HeatmapStyle {
    colorInterpolator: (t: number) => string;
    opacity: number;
    display: 'inline' | 'none';
    maxValue: number;
    unit: string;
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
                maxValue: 13,
                unit: 'm/s',
            };
        case HeatmapType.Solarmap:
            return {
                colorInterpolator: interpolateHclLong("yellow", "red"),
                opacity: 0.5,
                display: 'inline',
                maxValue: 225,
                unit: 'W/m²',
            };
        default:
            return {
                colorInterpolator: interpolateInferno,
                opacity: 0.15,
                display: 'inline',
                maxValue: 100,
                unit: 'unit',
            };
    }
}

// I use the D3 library to render a contour density map according to the radiation level.
export async function renderHeatmap(svgElement: SVGSVGElement, mapContainer : HTMLElement, data: DataPoint[], heatmapType: HeatmapType): Promise<void> {
    const svgDimensions: SVGDimensions = { width: svgElement.viewBox.baseVal.width, height: svgElement.viewBox.baseVal.height };
    const styleConfig = getStyleConfig(heatmapType);
    const contours = calculateContours(data, svgDimensions);
    const colorScale = setupColorScale(contours, styleConfig);
    createClipPath(svgElement);
    renderContours(svgElement, contours, colorScale, styleConfig, heatmapType);
    addLegend(mapContainer, styleConfig, heatmapType);
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
        .thresholds(20)
        (data);
}

function setupColorScale(contours: ContourMultiPolygon[], styleConfig: HeatmapStyle): ScaleSequential<string, never> {
    // Select the greatest value for each contour and interpolate color scale.
    const maxContourValue = Math.max(...contours.map(c => c.value));
    return scaleSequential(styleConfig.colorInterpolator).domain([0, maxContourValue]);
}

function addLegend(mapContainer: HTMLElement, styleConfig: HeatmapStyle, heatmapType: HeatmapType): void {
    const legend = Legend(scaleSequential([0, styleConfig.maxValue], styleConfig.colorInterpolator), {
        title: heatmapType + ' (' + styleConfig.unit + ')',
    });
    if(!legend) return;
    legend.setAttribute("id", `${heatmapType}-legend`);
    legend.style.display = styleConfig.display;
    legend.classList.add("legend-bottom-left");
    mapContainer.append(legend);
    
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

// This code is from the D3-color-legend library. I couldn't get the library to work with typescript, so I copied the code here and made some adjustments.
function Legend(color, {
    title,
    tickSize = 6,
    width = 320, 
    height = 54 + tickSize,
    marginTop = 18,
    marginRight = 0,
    marginBottom = 16 + tickSize,
    marginLeft = 0,
    ticks = width / 64,
    tickFormat,
    tickValues
  } = {}) {
  
    function ramp(color, n = 256) {
      const canvas = document.createElement("canvas");
      canvas.width = n;
      canvas.height = 1;
      const context = canvas.getContext("2d");
      for (let i = 0; i < n; ++i) {
        context.fillStyle = color(i / (n - 1));
        context.fillRect(i, 0, 1, 1);
      }
      return canvas;
    }
  
    const svg = create("svg")
        .attr("width", width)
        .attr("height", height)
        .attr("viewBox", [0, 0, width, height])
        .style("overflow", "visible")
        .style("display", "block");
  
    let tickAdjust = g => g.selectAll(".tick line").attr("y1", marginTop + marginBottom - height);
    let x;
  
    // Continuous
    if (color.interpolate) {
      const n = Math.min(color.domain().length, color.range().length);
  
      x = color.copy().rangeRound(quantize(interpolate(marginLeft, width - marginRight), n));
  
      svg.append("image")
          .attr("x", marginLeft)
          .attr("y", marginTop)
          .attr("width", width - marginLeft - marginRight)
          .attr("height", height - marginTop - marginBottom)
          .attr("preserveAspectRatio", "none")
          .attr("xlink:href", ramp(color.copy().domain(quantize(interpolate(0, 1), n))).toDataURL());
    }
  
    // Sequential
    else if (color.interpolator) {
      x = Object.assign(color.copy()
          .interpolator(interpolateRound(marginLeft, width - marginRight)),
          {range() { return [marginLeft, width - marginRight]; }});
  
      svg.append("image")
          .attr("x", marginLeft)
          .attr("y", marginTop)
          .attr("width", width - marginLeft - marginRight)
          .attr("height", height - marginTop - marginBottom)
          .attr("preserveAspectRatio", "none")
          .attr("xlink:href", ramp(color.interpolator()).toDataURL());
  
      // scaleSequentialQuantile doesn’t implement ticks or tickFormat.
      if (!x.ticks) {
        if (tickValues === undefined) {
          const n = Math.round(ticks + 1);
          tickValues = range(n).map(i => quantile(color.domain(), i / (n - 1)));
        }
        if (typeof tickFormat !== "function") {
          tickFormat = format(tickFormat === undefined ? ",f" : tickFormat);
        }
      }
    }
  
    // Threshold
    else if (color.invertExtent) {
      const thresholds
          = color.thresholds ? color.thresholds() // scaleQuantize
          : color.quantiles ? color.quantiles() // scaleQuantile
          : color.domain(); // scaleThreshold
  
      const thresholdFormat
          = tickFormat === undefined ? (d: any) => d
          : typeof tickFormat === "string" ? format(tickFormat)
          : tickFormat;
  
      x = scaleLinear()
          .domain([-1, color.range().length - 1])
          .rangeRound([marginLeft, width - marginRight]);
  
      svg.append("g")
        .selectAll("rect")
        .data(color.range())
        .join("rect")
          .attr("x", (d, i) => x(i - 1))
          .attr("y", marginTop)
          .attr("width", (d, i) => x(i) - x(i - 1))
          .attr("height", height - marginTop - marginBottom)
          .attr("fill", d => d);
  
      tickValues = d3.range(thresholds.length);
      tickFormat = i => thresholdFormat(thresholds[i], i);
    }
  
    // Ordinal
    else {
      x = scaleBand()
          .domain(color.domain())
          .rangeRound([marginLeft, width - marginRight]);
  
      svg.append("g")
        .selectAll("rect")
        .data(color.domain())
        .join("rect")
          .attr("x", x)
          .attr("y", marginTop)
          .attr("width", Math.max(0, x.bandwidth() - 1))
          .attr("height", height - marginTop - marginBottom)
          .attr("fill", color);
  
      tickAdjust = () => {};
    }
  
    svg.append("g")
        .attr("transform", `translate(0,${height - marginBottom})`)
        .call(axisBottom(x)
          .ticks(ticks, typeof tickFormat === "string" ? tickFormat : undefined)
          .tickFormat(typeof tickFormat === "function" ? tickFormat : undefined)
          .tickSize(tickSize)
          .tickValues(tickValues))
        .call(tickAdjust)
        .call(g => g.select(".domain").remove())
        .call(g => g.append("text")
          .attr("x", marginLeft)
          .attr("y", marginTop + marginBottom - height - 6)
          .attr("fill", "currentColor")
          .attr("text-anchor", "start")
          .attr("font-weight", "bold")
          .attr("class", "title")
          .text(title));
  
    return svg.node();
  }