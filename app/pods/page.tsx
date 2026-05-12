"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { getPods } from "../lib/api";
import type { PodInfo } from "../lib/types";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../components/ui/table";
import { Card, CardContent } from "../../components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "../../components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../components/ui/tabs";
import MetricChart from "../components/MetricChart";

function PhaseBadge({ phase }: { phase: string }) {
  const isRunning = phase === "Running";
  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
        isRunning
          ? "bg-green-900 text-green-300"
          : "bg-red-900 text-red-300"
      }`}
    >
      {phase}
    </span>
  );
}

export default function PodsPage() {
  const [selectedPod, setSelectedPod] = useState<PodInfo | null>(null);

  const { data: pods, isLoading, isError } = useQuery({
    queryKey: ["pods"],
    queryFn: () => getPods(),
  });

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold text-white">Pod 목록</h1>

      {isError && (
        <Card className="bg-red-950 border-red-800">
          <CardContent className="p-4 text-red-300 text-sm">
            Pod 정보를 불러올 수 없습니다. 백엔드 서버를 확인해주세요.
          </CardContent>
        </Card>
      )}

      <Card className="bg-gray-900 border-gray-800">
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-6 space-y-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="h-4 bg-gray-700 rounded animate-pulse" />
              ))}
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="border-gray-800">
                  <TableHead className="text-gray-400">Pod 이름</TableHead>
                  <TableHead className="text-gray-400">Namespace</TableHead>
                  <TableHead className="text-gray-400">Node</TableHead>
                  <TableHead className="text-gray-400">Phase</TableHead>
                  <TableHead className="text-gray-400">Ready</TableHead>
                  <TableHead className="text-gray-400">재시작 수</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {!pods || pods.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={6}
                      className="text-center text-gray-500 py-8"
                    >
                      Pod가 없습니다
                    </TableCell>
                  </TableRow>
                ) : (
                  pods.map((pod) => (
                    <TableRow
                      key={`${pod.namespace}/${pod.podName}`}
                      className="border-gray-800 cursor-pointer hover:bg-gray-800"
                      onClick={() => setSelectedPod(pod)}
                    >
                      <TableCell className="text-white font-medium text-sm">
                        {pod.podName}
                      </TableCell>
                      <TableCell className="text-gray-300 text-sm">
                        {pod.namespace}
                      </TableCell>
                      <TableCell className="text-gray-300 text-sm">
                        {pod.nodeName}
                      </TableCell>
                      <TableCell>
                        <PhaseBadge phase={pod.phase} />
                      </TableCell>
                      <TableCell className="text-gray-300 text-sm">
                        {pod.ready ? "✓" : "✗"}
                      </TableCell>
                      <TableCell className="text-gray-300 text-sm">
                        {pod.restartCount}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Dialog open={!!selectedPod} onOpenChange={() => setSelectedPod(null)}>
        <DialogContent className="bg-gray-900 border-gray-700 text-white max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-white">
              {selectedPod?.podName} 메트릭
            </DialogTitle>
          </DialogHeader>
          {selectedPod && (
            <Tabs defaultValue="cpu">
              <TabsList className="bg-gray-800">
                <TabsTrigger value="cpu">CPU</TabsTrigger>
                <TabsTrigger value="memory">Memory</TabsTrigger>
                <TabsTrigger value="error-rate">Error Rate</TabsTrigger>
              </TabsList>
              <TabsContent value="cpu" className="mt-4">
                <MetricChart podName={selectedPod.podName} metric="cpu" />
              </TabsContent>
              <TabsContent value="memory" className="mt-4">
                <MetricChart podName={selectedPod.podName} metric="memory" />
              </TabsContent>
              <TabsContent value="error-rate" className="mt-4">
                <MetricChart podName={selectedPod.podName} metric="error-rate" />
              </TabsContent>
            </Tabs>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
