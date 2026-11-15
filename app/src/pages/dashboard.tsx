import { useNavigate } from "react-router-dom"
import { RefreshCw } from "lucide-react"
import { AppShell } from "@/components/app-shell"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { DASHBOARD_SETS } from "@/data/products"

const LIST_URL = "/sets/ss27-m-urban-jungle"

export function DashboardPage() {
  const navigate = useNavigate()
  return (
    <AppShell crumbs={[{ label: "Dashboard" }]}>
      <div className="flex flex-1 flex-col gap-6 overflow-y-auto p-6">
        <div className="flex items-start justify-between gap-4">
          <div className="flex flex-col gap-2">
            <h1 className="text-2xl font-semibold">SS27, deadline 15 January 2027</h1>
            <p className="flex items-center gap-1.5 text-sm text-muted-foreground">
              <RefreshCw className="size-3.5" aria-hidden />
              Product data synced from PLM today
            </p>
          </div>
          <Button onClick={() => navigate(LIST_URL)}>Review products</Button>
        </div>

        <ul className="grid grid-cols-3 gap-4" aria-label="Summary">
          {[
            ["1", "AI finding to review"],
            ["17", "ready to approve"],
            ["18", "of 1,004 planned products imported"],
          ].map(([n, label]) => (
            <li key={label}>
              <Card className="gap-1 p-6">
                <span className="text-2xl font-semibold">{n}</span>
                <span className="text-sm text-muted-foreground">{label}</span>
              </Card>
            </li>
          ))}
        </ul>

        <section className="flex flex-col gap-3" aria-labelledby="workspace-heading">
          <h2 id="workspace-heading" className="text-lg font-semibold">
            Your workspace
          </h2>
          <Tabs defaultValue="active">
            <TabsList>
              <TabsTrigger value="active">Active product sets</TabsTrigger>
              <TabsTrigger value="published">Recently published DPP</TabsTrigger>
              <TabsTrigger value="viewed">Recently viewed products</TabsTrigger>
            </TabsList>
            <TabsContent value="active">
              <Card className="py-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="px-4">Set</TableHead>
                      <TableHead className="w-36">Status</TableHead>
                      <TableHead className="w-36">Progress</TableHead>
                      <TableHead className="w-44">Creation date</TableHead>
                      <TableHead className="w-44">Created by</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {DASHBOARD_SETS.map((s) => (
                      <TableRow
                        key={s.name}
                        className={s.clickable ? "cursor-pointer" : undefined}
                        onClick={s.clickable ? () => navigate(LIST_URL) : undefined}
                      >
                        <TableCell className="h-13 px-4 font-medium">
                          {s.clickable ? (
                            <a
                              href={LIST_URL}
                              onClick={(e) => {
                                e.preventDefault()
                                navigate(LIST_URL)
                              }}
                              className="hover:underline"
                            >
                              {s.name}
                            </a>
                          ) : (
                            s.name
                          )}
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">{s.status}</Badge>
                        </TableCell>
                        <TableCell>{s.progress}</TableCell>
                        <TableCell>{s.created}</TableCell>
                        <TableCell>{s.by}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </Card>
            </TabsContent>
            {/* Content of the other two tabs is out of scope. */}
            <TabsContent value="published" />
            <TabsContent value="viewed" />
          </Tabs>
        </section>
      </div>
    </AppShell>
  )
}
