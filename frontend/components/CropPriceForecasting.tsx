import React, { useState, useEffect, useMemo } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import {
  TrendingUp,
  Calendar,
  Download,
  Loader,
  MapPin,
  AlertCircle,
  BarChart3,
} from 'lucide-react';

const API_BASE_URL = 'http://localhost:8000';

// ==== Types ====
interface LocationData {
  states: string[];
  districts: Record<string, string[]>;
  crops: Record<string, Record<string, string[]>>;
}

interface HistoricalDataPoint {
  date: string;
  min_price: number;
  modal_price: number;
  max_price: number;
}

interface ForecastDataPoint extends HistoricalDataPoint {
  confidence_upper: number;
  confidence_lower: number;
}

interface ForecastMetrics {
  trend: string;
  avg_price: number;
  volatility: number;
  mape: number;
  data_points: number;
}

interface ForecastResult {
  historical_data: HistoricalDataPoint[];
  forecast_data: ForecastDataPoint[];
  metrics: ForecastMetrics;
}

// ==== Button Component ====
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
}

const Button: React.FC<ButtonProps> = ({ children, className = '', ...props }) => (
  <button className={className} {...props}>
    {children}
  </button>
);

// ==== Card Components ====
interface CardProps {
  children: React.ReactNode;
  className?: string;
}

const Card: React.FC<CardProps> = ({ children, className = '' }) => (
  <div className={`bg-white rounded-lg shadow-md ${className}`}>{children}</div>
);

const CardHeader: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div className="px-6 py-4 border-b border-gray-200">{children}</div>
);

const CardTitle: React.FC<{ children: React.ReactNode; className?: string }> = ({
  children,
  className = '',
}) => <h3 className={`text-lg font-semibold text-gray-800 ${className}`}>{children}</h3>;

const CardContent: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div className="px-6 py-4">{children}</div>
);

// ==== Main Component ====
const CropPriceForecasting: React.FC = () => {
  const [selectedState, setSelectedState] = useState('');
  const [selectedDistrict, setSelectedDistrict] = useState('');
  const [selectedCrop, setSelectedCrop] = useState('');
  const [forecastDays, setForecastDays] = useState<number>(30);
  const [priceType, setPriceType] = useState<'Modal_price' | 'Min_price' | 'Max_price'>('Modal_price');
  const [historicalData, setHistoricalData] = useState<HistoricalDataPoint[]>([]);
  const [forecastResult, setForecastResult] = useState<ForecastResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [locations, setLocations] = useState<LocationData | null>(null);

  // Load locations on component mount
  useEffect(() => {
    const loadLocations = async () => {
      try {
        const locationsResponse = await fetch(`${API_BASE_URL}/forecast/locations`);
        if (locationsResponse.ok) {
          const data: LocationData = await locationsResponse.json();
          setLocations(data);
        }
      } catch (error) {
        console.error('Failed to load locations:', error);
        setError('Failed to load locations. Please refresh the page.');
      }
    };

    loadLocations();
  }, []);

  const generateForecast = async () => {
    if (!selectedState || !selectedDistrict || !selectedCrop) {
      setError('Please select state, district, and crop');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${API_BASE_URL}/forecast`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          state: selectedState,
          district: selectedDistrict,
          crop: selectedCrop,
          price_type: priceType,
          forecast_days: forecastDays,
        }),
      });
      if (response.ok) {
        const data: ForecastResult = await response.json();
        setForecastResult(data);
        setHistoricalData(data.historical_data);
      } else {
        const errorData = await response.json();
        setError(errorData.detail || 'Failed to generate forecast');
      }
    } catch (error) {
      setError('Network error: Unable to connect to API');
    } finally {
      setLoading(false);
    }
  };

  // Clear forecast result when selection changes
  useEffect(() => {
    if (selectedState && selectedDistrict && selectedCrop) {
      setForecastResult(null);
    }
  }, [selectedState, selectedDistrict, selectedCrop]);

  const availableDistricts = useMemo(() => {
    return selectedState && locations?.districts ? locations.districts[selectedState] || [] : [];
  }, [selectedState, locations]);

  const availableCrops = useMemo(() => {
    return selectedState && selectedDistrict && locations?.crops?.[selectedState]?.[selectedDistrict]
      ? locations.crops[selectedState][selectedDistrict]
      : [];
  }, [selectedState, selectedDistrict, locations]);

  const chartData = useMemo(() => {
    if (!forecastResult) return [];
    return [
      ...(forecastResult.historical_data || []).map((item) => ({ ...item, type: 'historical' })),
      ...(forecastResult.forecast_data || []).map((item) => ({ ...item, type: 'forecast' })),
    ];
  }, [forecastResult]);

  const downloadForecast = () => {
    if (!forecastResult) return;
    const csvData = forecastResult.forecast_data.map((item) => ({
      Date: item.date,
      [`Predicted_${priceType}`]: item[priceType.toLowerCase() as keyof ForecastDataPoint].toFixed(2),
      Confidence_Upper: item.confidence_upper?.toFixed(2) || '',
      Confidence_Lower: item.confidence_lower?.toFixed(2) || '',
      State: selectedState,
      District: selectedDistrict,
      Crop: selectedCrop,
    }));

    const csvContent = [
      Object.keys(csvData[0]).join(','),
      ...csvData.map((row) => Object.values(row).join(',')),
    ].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${selectedState}_${selectedDistrict}_${selectedCrop}_forecast.csv`;
    a.click();
  };

  // =============================
  // JSX below (same as your code)
  // =============================

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2 flex items-center justify-center gap-3">
            <TrendingUp className="text-green-600" />
            Agricultural Price Forecasting
          </h1>
          <p className="text-gray-600">FastAPI-powered crop price prediction system</p>
        </div>

        {/* Location Selection */}
        {!locations ? (
          <div className="text-center py-8">
            <Loader className="animate-spin mx-auto mb-4 text-blue-600" size={48} />
            <p className="text-gray-600">Loading locations...</p>
          </div>
        ) : (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="text-purple-600" />
                Location & Crop Selection
              </CardTitle>
              <p className="text-sm text-gray-500 mt-1">
                Manually select your desired state, district, and crop for forecasting
              </p>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">State</label>
                  <select
                    value={selectedState}
                    onChange={(e) => {
                      setSelectedState(e.target.value);
                      // Clear dependent selections when state changes
                      setSelectedDistrict('');
                      setSelectedCrop('');
                    }}
                    className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select State</option>
                    {locations.states.map((state) => (
                      <option key={state} value={state}>{state}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">District</label>
                  <select
                    value={selectedDistrict}
                    onChange={(e) => {
                      setSelectedDistrict(e.target.value);
                      // Clear crop selection when district changes
                      setSelectedCrop('');
                    }}
                    className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500"
                    disabled={!selectedState}
                  >
                    <option value="">Select District</option>
                    {availableDistricts.map((district) => (
                      <option key={district} value={district}>{district}</option>
                    ))}
                  </select>
                  {!selectedState && (
                    <p className="text-xs text-gray-400 mt-1">Select a state first</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Crop</label>
                  <select
                    value={selectedCrop}
                    onChange={(e) => setSelectedCrop(e.target.value)}
                    className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500"
                    disabled={!selectedDistrict}
                  >
                    <option value="">Select Crop</option>
                    {availableCrops.map((crop) => (
                      <option key={crop} value={crop}>{crop}</option>
                    ))}
                  </select>
                  {!selectedDistrict && (
                    <p className="text-xs text-gray-400 mt-1">Select a district first</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Price Type</label>
                  <select
                    value={priceType}
                    onChange={(e) => setPriceType(e.target.value)}
                    className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="Modal_price">Modal Price</option>
                    <option value="Min_price">Min Price</option>
                    <option value="Max_price">Max Price</option>
                  </select>
                </div>
              </div>

              {/* Selection Summary */}
              {selectedState && (
                <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                  <p className="text-sm font-medium text-blue-800">Current Selection:</p>
                  <p className="text-blue-600">
                    {selectedState}
                    {selectedDistrict && ` → ${selectedDistrict}`}
                    {selectedCrop && ` → ${selectedCrop}`}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Forecasting Controls */}
        {selectedCrop && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="text-orange-600" />
                Generate Forecast
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col md:flex-row gap-4 items-end">
                <div>
                  <label className="block text-sm font-medium mb-2">Forecast Period (Days)</label>
                  <input
                    type="number"
                    min="7"
                    max="180"
                    value={forecastDays}
                    onChange={(e) => setForecastDays(parseInt(e.target.value))}
                    className="w-32 p-3 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <Button
                  onClick={generateForecast}
                  disabled={loading || !selectedCrop}
                  className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all font-semibold disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {loading ? <Loader className="animate-spin" size={20} /> : null}
                  Generate Forecast
                </Button>
                {forecastResult && (
                  <Button
                    onClick={downloadForecast}
                    className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-semibold flex items-center gap-2"
                  >
                    <Download size={20} />
                    Download Results
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Error Display */}
        {error && (
          <Card className="mb-8 bg-red-50 border border-red-200">
            <CardContent>
              <div className="flex items-center gap-2">
                <AlertCircle className="text-red-500" size={20} />
                <span className="text-red-700 font-medium">Error:</span>
                <span className="text-red-600">{error}</span>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Model Metrics */}
        {forecastResult?.metrics && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="text-indigo-600" />
                Model Insights & Summary
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <p className="text-sm text-gray-600">Price Trend</p>
                  <p className="text-xl font-bold text-blue-600">{forecastResult.metrics.trend}</p>
                </div>
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <p className="text-sm text-gray-600">Avg Price (₹/Q)</p>
                  <p className="text-xl font-bold text-green-600">₹{forecastResult.metrics.avg_price.toFixed(2)}</p>
                </div>
                <div className="text-center p-4 bg-yellow-50 rounded-lg">
                  <p className="text-sm text-gray-600">Volatility</p>
                  <p className="text-xl font-bold text-yellow-600">{forecastResult.metrics.volatility.toFixed(2)}</p>
                </div>
                <div className="text-center p-4 bg-purple-50 rounded-lg">
                  <p className="text-sm text-gray-600">Model Accuracy (MAPE)</p>
                  <p className="text-xl font-bold text-purple-600">{(100 - forecastResult.metrics.mape).toFixed(1)}%</p>
                </div>
              </div>
              
              {/* Additional metrics row */}
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 pt-4 border-t">
                <div className="text-center">
                  <p className="text-sm text-gray-600">Data Points Used</p>
                  <p className="text-lg font-bold text-blue-600">{forecastResult.metrics.data_points}</p>
                </div>
                <div className="text-center">
                  <p className="text-sm text-gray-600">Latest Price</p>
                  <p className="text-lg font-bold text-green-600">
                    ₹{historicalData[historicalData.length - 1]?.[priceType.toLowerCase()]?.toFixed(2) || 'N/A'}
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-sm text-gray-600">Forecast Period</p>
                  <p className="text-lg font-bold text-purple-600">{forecastDays} days</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Forecast Summary Cards */}
        {forecastResult?.forecast_data && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {/* Current vs Future Price */}
            <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
              <CardContent>
                <div className="text-center py-4">
                  <h4 className="font-semibold text-blue-800 mb-2">Price Comparison</h4>
                  <div className="space-y-2">
                    <div>
                      <p className="text-sm text-blue-600">Current Price</p>
                      <p className="text-2xl font-bold text-blue-800">
                        ₹{historicalData[historicalData.length - 1]?.[priceType.toLowerCase()]?.toFixed(2)}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-blue-600">Predicted Price ({forecastDays} days)</p>
                      <p className="text-2xl font-bold text-blue-800">
                        ₹{forecastResult.forecast_data[forecastResult.forecast_data.length - 1]?.[priceType.toLowerCase()]?.toFixed(2)}
                      </p>
                    </div>
                    {(() => {
                      const currentPrice = historicalData[historicalData.length - 1]?.[priceType.toLowerCase()];
                      const futurePrice = forecastResult.forecast_data[forecastResult.forecast_data.length - 1]?.[priceType.toLowerCase()];
                      const change = ((futurePrice - currentPrice) / currentPrice * 100);
                      return (
                        <div className={`p-2 rounded ${change >= 0 ? 'bg-green-100' : 'bg-red-100'}`}>
                          <p className={`font-bold ${change >= 0 ? 'text-green-700' : 'text-red-700'}`}>
                            {change >= 0 ? '+' : ''}{change.toFixed(1)}%
                          </p>
                        </div>
                      );
                    })()}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Price Range */}
            <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
              <CardContent>
                <div className="text-center py-4">
                  <h4 className="font-semibold text-green-800 mb-2">Forecast Range</h4>
                  <div className="space-y-2">
                    <div>
                      <p className="text-sm text-green-600">Minimum Expected</p>
                      <p className="text-xl font-bold text-green-800">
                        ₹{Math.min(...forecastResult.forecast_data.map(d => d[priceType.toLowerCase()])).toFixed(2)}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-green-600">Maximum Expected</p>
                      <p className="text-xl font-bold text-green-800">
                        ₹{Math.max(...forecastResult.forecast_data.map(d => d[priceType.toLowerCase()])).toFixed(2)}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-green-600">Average Forecast</p>
                      <p className="text-xl font-bold text-green-800">
                        ₹{(forecastResult.forecast_data.reduce((sum, d) => sum + d[priceType.toLowerCase()], 0) / forecastResult.forecast_data.length).toFixed(2)}
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Confidence Level */}
            <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
              <CardContent>
                <div className="text-center py-4">
                  <h4 className="font-semibold text-purple-800 mb-2">Confidence Band</h4>
                  <div className="space-y-2">
                    {(() => {
                      const lastForecast = forecastResult.forecast_data[forecastResult.forecast_data.length - 1];
                      return (
                        <>
                          <div>
                            <p className="text-sm text-purple-600">Upper Bound</p>
                            <p className="text-lg font-bold text-purple-800">
                              ₹{lastForecast.confidence_upper?.toFixed(2)}
                            </p>
                          </div>
                          <div>
                            <p className="text-sm text-purple-600">Lower Bound</p>
                            <p className="text-lg font-bold text-purple-800">
                              ₹{lastForecast.confidence_lower?.toFixed(2)}
                            </p>
                          </div>
                          <div className="p-2 bg-purple-200 rounded">
                            <p className="text-sm font-medium text-purple-800">
                              Confidence Range: ±₹{((lastForecast.confidence_upper - lastForecast.confidence_lower) / 2).toFixed(0)}
                            </p>
                          </div>
                        </>
                      );
                    })()}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Chart */}
        {chartData.length > 0 && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>
                Price Trends & Forecast: {selectedCrop} in {selectedDistrict}, {selectedState}
              </CardTitle>
              <p className="text-sm text-gray-500 mt-2">
                Historical data ({historicalData.length} points) and {forecastResult.forecast_data.length}-day forecast with confidence intervals
              </p>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={500}>
                <LineChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis 
                    dataKey="date" 
                    tick={{fontSize: 12}}
                    tickFormatter={(date) => {
                      const d = new Date(date);
                      return `${d.getMonth() + 1}/${d.getDate()}`;
                    }}
                  />
                  <YAxis 
                    tick={{fontSize: 12}}
                    label={{ value: 'Price (₹/Quintal)', angle: -90, position: 'insideLeft' }}
                    domain={['dataMin - 100', 'dataMax + 100']}
                  />
                  <Tooltip 
                    labelFormatter={(date) => `Date: ${new Date(date).toLocaleDateString()}`}
                    formatter={(value, name, props) => {
                      const isHistorical = props.payload.type === 'historical';
                      const prefix = isHistorical ? 'Historical' : 'Forecast';
                      return [`₹${value?.toFixed(2)}`, `${prefix} ${name}`];
                    }}
                    contentStyle={{ backgroundColor: '#f8fafc', border: '1px solid #e2e8f0' }}
                  />
                  <Legend />
                  
                  {/* Main price line */}
                  <Line
                    type="monotone"
                    dataKey={priceType.toLowerCase()}
                    stroke="#2563eb"
                    strokeWidth={3}
                    dot={(props) => {
                      const { payload } = props;
                      return payload.type === 'forecast' ? 
                        <circle {...props} fill="#dc2626" stroke="#dc2626" strokeWidth={2} r={4} /> :
                        <circle {...props} fill="#2563eb" stroke="#2563eb" strokeWidth={2} r={3} />;
                    }}
                    name={`${priceType.replace('_', ' ')}`}
                    connectNulls={false}
                  />
                  
                  {/* Confidence bands */}
                  <Line
                    type="monotone"
                    dataKey="confidence_upper"
                    stroke="#f59e0b"
                    strokeWidth={1}
                    strokeDasharray="4 4"
                    dot={false}
                    name="Upper Confidence"
                  />
                  <Line
                    type="monotone"
                    dataKey="confidence_lower"
                    stroke="#f59e0b"
                    strokeWidth={1}
                    strokeDasharray="4 4"
                    dot={false}
                    name="Lower Confidence"
                  />
                </LineChart>
              </ResponsiveContainer>
              
              {/* Chart Legend */}
              <div className="mt-4 flex flex-wrap justify-center gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-1 bg-blue-600 rounded"></div>
                  <span>Historical Data</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-red-600 rounded-full"></div>
                  <span>Forecast Data</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-1 border-t-2 border-dashed border-yellow-600"></div>
                  <span>Confidence Interval</span>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Detailed Forecast Table */}
        {forecastResult?.forecast_data && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Detailed Forecast Data</CardTitle>
              <p className="text-sm text-gray-500">Daily predictions for the next {forecastDays} days</p>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b bg-gray-50">
                      <th className="text-left p-3 font-semibold">Date</th>
                      <th className="text-right p-3 font-semibold">Min Price</th>
                      <th className="text-right p-3 font-semibold">Modal Price</th>
                      <th className="text-right p-3 font-semibold">Max Price</th>
                      <th className="text-right p-3 font-semibold">Confidence Range</th>
                    </tr>
                  </thead>
                  <tbody>
                    {forecastResult.forecast_data.slice(0, 10).map((item, index) => (
                      <tr key={index} className="border-b hover:bg-gray-50">
                        <td className="p-3 font-medium">
                          {new Date(item.date).toLocaleDateString()}
                        </td>
                        <td className="p-3 text-right">₹{item.min_price.toFixed(2)}</td>
                        <td className="p-3 text-right font-semibold">₹{item.modal_price.toFixed(2)}</td>
                        <td className="p-3 text-right">₹{item.max_price.toFixed(2)}</td>
                        <td className="p-3 text-right text-sm text-gray-600">
                          ₹{item.confidence_lower.toFixed(0)} - ₹{item.confidence_upper.toFixed(0)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {forecastResult.forecast_data.length > 10 && (
                  <div className="text-center p-4 text-gray-500">
                    ... and {forecastResult.forecast_data.length - 10} more days
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Loading State */}
        {loading && (
          <Card className="mb-8">
            <CardContent>
              <div className="text-center py-8">
                <Loader className="animate-spin mx-auto mb-4 text-blue-600" size={48} />
                <p className="text-gray-600">Processing your request...</p>
                <p className="text-sm text-gray-400 mt-2">Analyzing {selectedCrop} price patterns in {selectedDistrict}, {selectedState}</p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Footer */}
        <div className="text-center py-8 text-gray-400 text-sm">
          <p>Agricultural Price Forecasting System • Powered by FastAPI & Machine Learning</p>
        </div>
      </div>
    </div>
  );
};

export default CropPriceForecasting;
