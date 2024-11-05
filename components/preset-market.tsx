'use client'

import * as React from 'react'
import { Search, Tag, ChevronRight, User, BarChart2 } from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Separator } from '@/components/ui/separator'
import { Toggle } from '@/components/ui/toggle'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'

interface Preset {
  id: string
  title: string
  description: string
  agents: Array<{
    id: string
    name: string
    role: string
  }>
  creator: {
    name: string
    id: string
  }
  tags: string[]
  usageCount: number
}

const MOCK_PRESETS: Preset[] = [
  {
    id: 'preset-1',
    title: '客服工作流',
    description: '自动化客户服务响应流程，包含问题分类、回答生成和升级处理。',
    agents: [
      { id: 'a1', name: '分类助手', role: '问题分类' },
      { id: 'a2', name: '回答生成器', role: '回答生成' },
      { id: 'a3', name: '质量检查', role: '答案审核' },
    ],
    creator: {
      name: '系统管理员',
      id: 'admin-1',
    },
    tags: ['客服', '自动化', '工作流'],
    usageCount: 1234,
  },
  {
    id: 'preset-2',
    title: '内容创作助手',
    description: '多步骤内容创作流程，包含主题研究、大纲生成和内容撰写。',
    agents: [
      { id: 'a4', name: '研究助手', role: '主题研究' },
      { id: 'a5', name: '大纲生成器', role: '结构规划' },
      { id: 'a6', name: '写作助手', role: '内容创作' },
    ],
    creator: {
      name: '内容团队',
      id: 'team-1',
    },
    tags: ['创作', '写作', '内容'],
    usageCount: 5678,
  },
]

export function PresetMarket() {
  const [searchQuery, setSearchQuery] = React.useState('')
  const [selectedTags, setSelectedTags] = React.useState<string[]>([])
  const [filteredPresets, setFilteredPresets] = React.useState(MOCK_PRESETS)

  // Get unique tags from all presets
  const allTags = React.useMemo(() => {
    const tags = new Set<string>()
    MOCK_PRESETS.forEach(preset => {
      preset.tags.forEach(tag => tags.add(tag))
    })
    return Array.from(tags)
  }, [])

  // Filter presets based on search query and selected tags
  React.useEffect(() => {
    const filtered = MOCK_PRESETS.filter(preset => {
      const matchesSearch =
        searchQuery === '' ||
        preset.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        preset.description.toLowerCase().includes(searchQuery.toLowerCase())

      const matchesTags =
        selectedTags.length === 0 ||
        selectedTags.every(tag => preset.tags.includes(tag))

      return matchesSearch && matchesTags
    })
    setFilteredPresets(filtered)
  }, [searchQuery, selectedTags])

  const toggleTag = (tag: string) => {
    setSelectedTags(prev =>
      prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
    )
  }

  return (
    <div className="flex flex-col gap-6 p-6">
      <div className="flex flex-col gap-4">
        <h1 className="text-2xl font-bold">预设市场</h1>
        <div className="flex flex-col gap-4">
          <div className="relative">
            <Search className="absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="搜索预设..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="pl-8"
            />
          </div>
          <div className="flex flex-wrap gap-2">
            {allTags.map(tag => (
              <Toggle
                key={tag}
                pressed={selectedTags.includes(tag)}
                onPressedChange={() => toggleTag(tag)}
                variant="outline"
                size="sm"
              >
                <Tag className="mr-2 h-3 w-3" />
                {tag}
              </Toggle>
            ))}
          </div>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {filteredPresets.map((preset, index) => (
          <Card
            key={preset.id}
            className="group transition-all duration-300 hover:shadow-lg"
          >
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex flex-col">
                  <div className="flex items-center gap-2">
                    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-sm text-primary-foreground">
                      {index + 1}
                    </span>
                    <h3 className="font-semibold">{preset.title}</h3>
                  </div>
                  <div className="mt-1 flex items-center text-sm text-muted-foreground">
                    <User className="mr-1 h-3 w-3" />
                    <span>@{preset.creator.name}</span>
                  </div>
                </div>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="flex items-center text-sm text-muted-foreground">
                      <BarChart2 className="mr-1 h-4 w-4" />
                      <span>{preset.usageCount}</span>
                    </div>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>使用次数</p>
                  </TooltipContent>
                </Tooltip>
              </div>
              <p className="mt-2 text-sm text-muted-foreground">
                {preset.description}
              </p>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col gap-4">
                <div>
                  <h4 className="text-sm font-semibold">Agents</h4>
                  <div className="mt-2 flex items-center overflow-x-auto pb-2">
                    {preset.agents.map((agent, index) => (
                      <React.Fragment key={agent.id}>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <div className="flex flex-col items-center">
                              <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center">
                                {agent.name[0]}
                              </div>
                              <span className="mt-1 text-xs max-w-[60px] truncate">
                                {agent.name}
                              </span>
                            </div>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>{agent.role}</p>
                          </TooltipContent>
                        </Tooltip>
                        {index < preset.agents.length - 1 && (
                          <ChevronRight className="mx-2 h-4 w-4 text-muted-foreground shrink-0" />
                        )}
                      </React.Fragment>
                    ))}
                  </div>
                </div>
                <Separator />
                <div className="flex flex-wrap gap-2">
                  {preset.tags.map(tag => (
                    <Badge key={tag} variant="secondary">
                      <Tag className="mr-1 h-3 w-3" />
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}