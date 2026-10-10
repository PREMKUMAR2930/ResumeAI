import React from "react";
import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Cell
} from "recharts";
import { TopicScore } from "../types";

interface SkillRadarChartProps {
  topicScores: TopicScore[];
}

export const SkillRadarChart: React.FC<SkillRadarChartProps> = ({ topicScores }) => {
  if (!topicScores || topicScores.length === 0) {
    return (
      <div className="p-8 text-center text-xs text-slate-400 bg-white rounded-2xl border border-slate-200">
        No topic metrics available for visualization.
      </div>
    );
  }

  const chartData = topicScores.map((t) => ({
    topic: t.topic.length > 18 ? `${t.topic.slice(0, 16)}...` : t.topic,
    fullTopic: t.topic,
    score: t.score,
    correctness: t.correctness_avg,
    relevance: t.relevance_avg
  }));

  const getBarColor = (score: number) => {
    if (score >= 80) return "#10b981"; // emerald
    if (score >= 60) return "#4f46e5"; // indigo
    return "#f59e0b"; // amber
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Topic Bar Chart */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
        <h3 className="font-bold text-slate-900 text-sm">Topic Performance Breakdown</h3>
        <p className="text-xs text-slate-500">Percentage score achieved across individual technical concepts</p>

        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis dataKey="topic" tick={{ fontSize: 10, fill: '#64748b' }} interval={0} angle={-25} textAnchor="end" />
              <YAxis domain={[0, 100]} tick={{ fontSize: 10, fill: '#64748b' }} />
              <Tooltip
                contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px', color: '#fff', fontSize: '11px' }}
                formatter={(val: any) => [`${val}%`, 'Score']}
                labelFormatter={(_, payload) => payload[0]?.payload?.fullTopic || ''}
              />
              <Bar dataKey="score" radius={[6, 6, 0, 0]}>
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={getBarColor(entry.score)} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Radar Chart (if >= 3 topics) or Detailed Metric Breakdown */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
        <h3 className="font-bold text-slate-900 text-sm">Competency Radar Spectrum</h3>
        <p className="text-xs text-slate-500">Multidimensional skill coverage based on candidate response analysis</p>

        <div className="h-64 w-full flex items-center justify-center">
          {chartData.length >= 3 ? (
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart cx="50%" cy="50%" outerRadius="75%" data={chartData}>
                <PolarGrid stroke="#e2e8f0" />
                <PolarAngleAxis dataKey="topic" tick={{ fill: '#475569', fontSize: 10 }} />
                <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fontSize: 9, fill: '#94a3b8' }} />
                <Radar
                  name="Score"
                  dataKey="score"
                  stroke="#4f46e5"
                  fill="#6366f1"
                  fillOpacity={0.4}
                />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px', color: '#fff', fontSize: '11px' }}
                  formatter={(val: any) => [`${val}%`, 'Score']}
                />
              </RadarChart>
            </ResponsiveContainer>
          ) : (
            <div className="w-full space-y-3">
              {topicScores.map((t, idx) => (
                <div key={idx} className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                  <div className="flex justify-between text-xs font-semibold text-slate-800">
                    <span>{t.topic}</span>
                    <span className="text-brand-600">{t.score}%</span>
                  </div>
                  <div className="w-full h-2 bg-slate-200 rounded-full mt-1.5 overflow-hidden">
                    <div
                      className="h-full bg-brand-600 rounded-full"
                      style={{ width: `${t.score}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
