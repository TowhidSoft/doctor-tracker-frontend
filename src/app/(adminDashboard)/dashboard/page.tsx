"use client";

import { useState } from "react";
import { Button, Segmented, Skeleton } from "antd";
import { Activity, Stethoscope, UserPlus, Users } from "lucide-react";
import PageHeader from "@/components/doctor-tracker/PageHeader";
import StatCard from "@/components/doctor-tracker/StatCard";
import ChartCard from "@/components/doctor-tracker/dashboard/ChartCard";
import TimelineChart from "@/components/doctor-tracker/dashboard/TimelineChart";
import BarListChart from "@/components/doctor-tracker/dashboard/BarListChart";
import DonutChart from "@/components/doctor-tracker/dashboard/DonutChart";
import RecentPatients from "@/components/doctor-tracker/dashboard/RecentPatients";
import { AnalyticsRange, useGetAnalyticsOverviewQuery } from "@/redux/service/admin/analyticsApi";

const RANGE_OPTIONS = [
  { label: "7 days", value: 7 },
  { label: "30 days", value: 30 },
  { label: "90 days", value: 90 },
];

const GENDER_COLORS: Record<string, string> = {
  Male: "#2558B3",
  Female: "#2BAE90",
  Others: "#F5821F",
};

export default function DashboardPage() {
  const [days, setDays] = useState<AnalyticsRange>(30);
  const { data, isLoading, isFetching, isError, refetch } = useGetAnalyticsOverviewQuery({ days });
  const overview = data?.data;

  const header = (
    <PageHeader
      title="Dashboard"
      description="How the doctor roster and patient intake are trending."
      actions={<Segmented options={RANGE_OPTIONS} value={days} onChange={(value) => setDays(value as AnalyticsRange)} />}
    />
  );

  if (isLoading) {
    return (
      <div>
        {header}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {Array.from({ length: 4 }, (_, i) => (
            <div key={i} className="rounded-xl border border-[#E5E7EB] bg-white p-5">
              <Skeleton active avatar paragraph={{ rows: 1 }} />
            </div>
          ))}
        </div>
        <div className="mt-6 rounded-xl border border-[#E5E7EB] bg-white p-5">
          <Skeleton active paragraph={{ rows: 6 }} />
        </div>
      </div>
    );
  }

  if (isError || !overview) {
    return (
      <div>
        {header}
        <div className="flex items-center justify-between rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          <span>The dashboard could not be loaded.</span>
          <Button size="small" onClick={() => refetch()}>
            Try again
          </Button>
        </div>
      </div>
    );
  }

  const { totals } = overview;
  const topDoctor = overview.patientsPerDoctor[0];
  const noActivity = overview.timeline.every((point) => point.patients === 0 && point.doctors === 0);

  return (
    <div className={isFetching ? "opacity-80 transition-opacity" : "transition-opacity"}>
      {header}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Total doctors" value={totals.doctors} hint={`+${totals.newDoctors} in the last ${days} days`} icon={<Stethoscope size={20} />} />
        <StatCard label="Total patients" value={totals.patients} hint={`+${totals.newPatients} in the last ${days} days`} icon={<Users size={20} />} tone="teal" />
        <StatCard label="Patients per doctor" value={totals.avgPatientsPerDoctor} hint="Average across all doctors" icon={<Activity size={20} />} tone="accent" />
        <StatCard
          label="Busiest doctor"
          value={topDoctor ? topDoctor.name : "—"}
          hint={topDoctor ? `${topDoctor.count} patients · ${topDoctor.specialization}` : "No patients yet"}
          icon={<UserPlus size={20} />}
        />
      </div>

      <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-3">
        <ChartCard
          className="lg:col-span-2"
          title="Registrations over time"
          description={`New patients and doctors per day, last ${days} days`}
          isEmpty={noActivity}
          height={280}
        >
          <TimelineChart data={overview.timeline} />
        </ChartCard>

        <ChartCard title="Patients by gender" description="All patients" isEmpty={overview.gender.length === 0} height={280}>
          <DonutChart data={overview.gender} colors={GENDER_COLORS} centerLabel="patients" />
        </ChartCard>
      </div>

      <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-3">
        <ChartCard
          className="lg:col-span-2"
          title="Patients per doctor"
          description="Doctors with the most patients"
          isEmpty={overview.patientsPerDoctor.length === 0}
        >
          <BarListChart
            data={overview.patientsPerDoctor.map((d) => ({ name: d.name, count: d.count }))}
            seriesName="Patients"
          />
        </ChartCard>

        <ChartCard title="Recent patients" description="Latest additions" isEmpty={overview.recentPatients.length === 0}>
          <RecentPatients patients={overview.recentPatients} />
        </ChartCard>
      </div>

      <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-2">
        <ChartCard title="Top conditions" description="Most common patient conditions" isEmpty={overview.conditions.length === 0}>
          <BarListChart data={overview.conditions} color="#2BAE90" seriesName="Patients" />
        </ChartCard>

        <ChartCard title="Doctors by specialization" description="How the roster is distributed" isEmpty={overview.specializations.length === 0}>
          <BarListChart data={overview.specializations} color="#F5821F" seriesName="Doctors" />
        </ChartCard>
      </div>
    </div>
  );
}
