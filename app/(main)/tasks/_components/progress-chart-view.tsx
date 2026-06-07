'use client'

import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from 'recharts'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from '@/components/ui/chart'

const chartConfig = {
  progress: {
    label: 'Progreso',
    color: 'var(--primary)',
  },
} satisfies ChartConfig

interface ProgressChartViewProps {
  data: Array<{ date: string; progress: number }>
}

export function ProgressChartView({ data }: ProgressChartViewProps) {
  return (
    <Card className='@container/card'>
      <CardHeader>
        <CardTitle>Evolución del progreso</CardTitle>
        <CardDescription>Avance acumulado del proyecto, por día</CardDescription>
      </CardHeader>
      <CardContent className='px-2 pt-4 sm:px-6 sm:pt-6'>
        {data.length === 0 ? (
          <p className='text-sm text-muted-foreground'>
            Todavía no hay tareas completadas para mostrar la evolución.
          </p>
        ) : (
          <ChartContainer config={chartConfig} className='aspect-auto h-[250px] w-full'>
            <AreaChart data={data}>
              <defs>
                <linearGradient id='fillProgress' x1='0' y1='0' x2='0' y2='1'>
                  <stop offset='5%' stopColor='var(--color-progress)' stopOpacity={0.8} />
                  <stop offset='95%' stopColor='var(--color-progress)' stopOpacity={0.1} />
                </linearGradient>
              </defs>
              <CartesianGrid vertical={false} />
              <XAxis
                dataKey='date'
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                minTickGap={32}
                tickFormatter={(value) =>
                  new Date(value).toLocaleDateString('es', { month: 'short', day: 'numeric' })
                }
              />
              <YAxis
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                domain={[0, 100]}
                tickFormatter={(value) => `${value}%`}
              />
              <ChartTooltip
                cursor={false}
                content={
                  <ChartTooltipContent
                    labelFormatter={(value) =>
                      new Date(value).toLocaleDateString('es', { month: 'short', day: 'numeric' })
                    }
                    formatter={(value) => [`${value}%`, ' Progreso acumulado']}
                  />
                }
              />
              <Area
                dataKey='progress'
                type='natural'
                fill='url(#fillProgress)'
                stroke='var(--color-progress)'
              />
            </AreaChart>
          </ChartContainer>
        )}
      </CardContent>
    </Card>
  )
}
