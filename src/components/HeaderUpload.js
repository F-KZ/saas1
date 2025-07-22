import { Separator } from "@/components/ui/separator"
import Link from "next/link"

export function SeparatorDemo() {
  return (
    <div>
      <div className="space-y-1">
        <h4 className="text-sm leading-none font-medium">Radix Primitives</h4>
        <p className="text-muted-foreground text-sm">
          An open-source UI component library.
        </p>
      </div>
      <Separator className="my-4" />
      <div className="flex h-5 items-center space-x-4 text-sm">
        <div>
        <button
              onClick={extractSkills}
              disabled={skillsLoading}
              className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 disabled:bg-gray-400 transition-colors"
            >
              {skillsLoading ? 'Extraction...' : 'Extraire les compétences (Regex)'}
            </button>
        </div>
        <Separator orientation="vertical" />
        <div>
        <button
              onClick={extractSkillsNLP}
              disabled={skillsLoading}
              className="bg-purple-500 text-white px-4 py-2 rounded hover:bg-purple-600 disabled:bg-gray-400 transition-colors"
            >
              {skillsLoading ? 'Extraction...' : 'Extraire les compétences (NLP)'}
            </button>
        </div>
        <Separator orientation="vertical" />
        <div>
        <button className='text-sm font-light shadow-lg rounded-lg border border-gray-200 p-3 hover:bg-gray-50 transition-colors'>
              <Link href="/JobSearch">Lancer l&apos;analyse</Link>
            </button>
        </div>
      </div>
    </div>
  )
}
