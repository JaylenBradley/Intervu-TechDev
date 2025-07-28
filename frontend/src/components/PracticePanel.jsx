import React from "react";
import {
  APPROACHES,
  COMPLEXITIES,
} from "../utils/constants";
import SortableLine from "./SortableLine.jsx";
import { DndContext, closestCenter } from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";


export default function PracticePanel({
  question,          
  currentScore,
  approachSel,
  setApproachSel,
  statusA,
  checkApproach,
  sensors,
  currentLines,            
  handleDragStart,
  handleDragEnd,
  wrongLineIds,
  fetchExplanation,
  statusLines,
  wrongDetail,
  checkLines,
  shuffleCurrent,
  timeSel,
  setTimeSel,
  spaceSel,
  setSpaceSel,
  statusCx,
  checkComplexities,
  explain
}) {
const q = question;
const borderA =
  statusA === "correct"   ? "border-green-500"
: statusA === "incorrect" ? "border-red-500"
                           : "border-app-primary";

                           const {
  approach   : { text: explainA,  loading: loadA  },
  indent     : { text: explainI,  loading: loadI  },
  complexity : { text: explainCx, loading: loadCx },
} = explain;

const borderTime =
  statusCx === "correct" || statusCx === "space" ? "border-green-500"
: statusCx === "time"   || statusCx === "both"  ? "border-red-500"
                                                 : "border-app-primary";

const borderSpace =
  statusCx === "correct" || statusCx === "time" ? "border-green-500"
: statusCx === "space"  || statusCx === "both" ? "border-red-500"
                                                : "border-app-primary";

  return (
    <>
      {/* ─────────────── Score Display ─────────────── */}
      <div className="bg-white rounded-xl shadow-lg p-4 mb-4">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-semibold text-app-primary">
            Current Question Score
          </h3>
          <div className="flex items-center gap-2">
            <span className={`text-2xl font-bold ${currentScore >= 80 ? 'text-green-600' : currentScore >= 60 ? 'text-yellow-600' : 'text-red-600'}`}>
              {currentScore}
            </span>
            <span className="text-gray-500">/100</span>
          </div>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
          <div
            className={`h-2 rounded-full transition-all duration-300 ${currentScore >= 80 ? 'bg-green-500' : currentScore >= 60 ? 'bg-yellow-500' : 'bg-red-500'}`}
            style={{ width: `${currentScore}%` }}
          />
        </div>
      </div>

      {/* ─────────────── Approach Card ─────────────── */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h3 className="text-xl font-semibold text-app-primary mb-4">
          Select Approach
        </h3>

        <select
          value={approachSel}
          onChange={(e) => setApproachSel(e.target.value)}
          onFocus={() => setStatusA(null)}                  
        className={`w-full md:w-64 px-3 py-2 border ${borderA} rounded-lg
                     bg-app-background text-app-text focus:outline-none cursor-pointer`}
        >
          <option value="">-- select --</option>
          {APPROACHES.map((a) => (
            <option key={a}>{a}</option>
          ))}
        </select>

        <div className="flex flex-wrap mt-4 gap-4">
          <button
            onClick={checkApproach}
            className="btn-primary px-6 py-2 rounded-lg font-semibold cursor-pointer"
          >
            Check
          </button>
            <button
             onClick={() => fetchExplanation("approach")}
            className="
              btn px-6 py-2 rounded-lg font-semibold border border-app-primary
              transition-colors cursor-pointer"
            >
            Explain Answer 
            </button>
            {loadA ? (
            <p className="mt-2 text-sm text-gray-600 italic">Generating explanation…</p>
            ) : explainA && (
            <p className="mt-2 text-sm text-gray-600 border border-gray-300 rounded p-2">{explainA}</p>
            )}

          {statusA === "correct" && (
            <span className="self-center text-sm font-medium text-green-600">
              ✔ Correct
            </span>
          )}
          {statusA === "incorrect" && (
            <span className="self-center text-sm font-medium text-red-600">
              ✖ Try again
            </span>
          )}
        </div>
      </div>

      {/* ───────────── Re‑order & Indent Card ───────────── */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h3 className="text-xl font-semibold text-app-primary mb-4">
          Order & Indent Code
        </h3>

        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={currentLines.map((l) => l.id)}
            strategy={verticalListSortingStrategy}
          >
            <div className="space-y-2 mb-6">
              {currentLines.map((l) => (
                <SortableLine
                  key={l.id}
                  line={l}
                  isWrong={wrongLineIds.has(l.id)}
                  highlightCorrect={statusLines === "correct"}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>

        <div className="flex flex-wrap gap-4">
          <button
            onClick={checkLines}
            className="btn-primary px-6 py-2 rounded-lg font-semibold cursor-pointer"
          >
            Check Code
          </button>
          <button
            onClick={shuffleCurrent}
            className="btn-primary px-6 py-2 rounded-lg font-semibold cursor-pointer"
          >
            Shuffle
          </button>
            <button
             onClick={() => fetchExplanation("indent")}
            className="
              btn px-6 py-2 rounded-lg font-semibold border border-app-primary
              transition-colors cursor-pointer"
            >
            Explain Answer 
            </button>
            {loadI ? (
            <p className="mt-2 text-sm text-gray-600 italic">Generating explanation…</p>
            ) : explainI && (
            <p className="mt-2 text-sm text-gray-600 border border-gray-300 rounded p-2">{explainI}</p>
            )}

          {statusLines === "correct" && (
            <span className="ml-auto self-center text-sm font-medium text-green-600">
              ✔ Correct
            </span>
          )}
          {statusLines === "incorrect" && (
            <span className="ml-auto self-center text-sm font-medium text-red-600">
              {wrongDetail === "indent"
                ? "✖ Indent wrong"
                : wrongDetail === "order"
                ? "✖ Order wrong"
                : "✖ Both wrong"}
            </span>
          )}
        </div>
      </div>

      {/* ─────────────── Complexity Card ─────────────── */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h3 className="text-xl font-semibold text-app-primary mb-4">
          Time & Space Complexity
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <select
            value={timeSel}
            onFocus={() => setStatusCx(null)}
            onChange={(e) => setTimeSel(e.target.value)}
            className={`w-full px-3 py-2 border ${borderTime} rounded-lg
              bg-app-background text-app-text cursor-pointer`}
          >
            <option value="">-- time --</option>
            {COMPLEXITIES.map((c) => (
              <option key={c}>{c}</option>
            ))}
          </select>

          <select
            value={spaceSel}
            onChange={(e) => setSpaceSel(e.target.value)}
             onFocus={() => setStatusCx(null)}
            className={`w-full px-3 py-2 border ${borderSpace} rounded-lg
                        bg-app-background text-app-text cursor-pointer`}
          >
            <option value="">-- space --</option>
            {COMPLEXITIES.map((c) => (
              <option key={c}>{c}</option>
            ))}
          </select>
        </div>

        <div className="flex flex-wrap mt-4 gap-4">
          <button
            onClick={checkComplexities}
            className="btn-primary px-6 py-2 rounded-lg font-semibold cursor-pointer"
          >
            Check
          </button>
          <button
             onClick={() => fetchExplanation("complexity")}
            className="
              btn px-6 py-2 rounded-lg font-semibold border border-app-primary
              transition-colors cursor-pointer"
            >
            Explain Answer 
            </button>
           {loadCx ? (
            <p className="mt-2 text-sm text-gray-600 italic">Generating explanation…</p>
            ) : explainCx && (
            <p className="mt-2 text-sm text-gray-600 border border-gray-300 rounded p-2">{explainCx}</p>
            )}

          {statusCx === "correct" && (
            <span className="self-center text-sm font-medium text-green-600">
              ✔ Both correct
            </span>
          )}
          {statusCx === "time" && (
            <span className="self-center text-sm font-medium text-red-600">
              ✖ Time wrong
            </span>
          )}
          {statusCx === "space" && (
            <span className="self-center text-sm font-medium text-red-600">
              ✖ Space wrong
            </span>
          )}
          {statusCx === "both" && (
            <span className="self-center text-sm font-medium text-red-600">
              ✖ Both wrong
            </span>
          )}
        </div>
      </div>
    </>
  );
}
