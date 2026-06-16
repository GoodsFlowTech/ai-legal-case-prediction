import { useState, useMemo } from "react";
import { Search, ChevronDown, Check, HelpCircle, RefreshCw } from "lucide-react";
import { CASE_CATEGORIES, CaseCategory, QuestionnaireField } from "../constants/caseTypes";

interface CaseTypeSelectorProps {
  selectedCategory: CaseCategory | null;
  setSelectedCategory: (category: CaseCategory | null) => void;
  selectedSubcategory: string;
  setSelectedSubcategory: (sub: string) => void;
  questionnaireValues: Record<string, any>;
  setQuestionnaireValues: (vals: Record<string, any>) => void;
}

export default function CaseTypeSelector({
  selectedCategory,
  setSelectedCategory,
  selectedSubcategory,
  setSelectedSubcategory,
  questionnaireValues,
  setQuestionnaireValues,
}: CaseTypeSelectorProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [dropdownOpen, setDropdownOpen] = useState(false);

  // Filter categories based on search query
  const filteredCategories = useMemo(() => {
    if (!searchQuery.trim()) return CASE_CATEGORIES;
    return CASE_CATEGORIES.filter((category) =>
      category.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      category.subcategories.some(sub => sub.toLowerCase().includes(searchQuery.toLowerCase()))
    );
  }, [searchQuery]);

  const handleSelectCategory = (category: CaseCategory) => {
    setSelectedCategory(category);
    setSelectedSubcategory("");
    setQuestionnaireValues({});
    setDropdownOpen(false);
    setSearchQuery("");
  };

  const handleFieldChange = (fieldId: string, value: string | number) => {
    setQuestionnaireValues({
      ...questionnaireValues,
      [fieldId]: value,
    });
  };

  const handleReset = () => {
    setSelectedCategory(null);
    setSelectedSubcategory("");
    setQuestionnaireValues({});
    setSearchQuery("");
  };

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs font-sans">
      <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
        <div>
          <h3 className="text-sm font-bold text-slate-900 tracking-tight">
            Case Jurisdictional Classification
          </h3>
          <p className="text-[11px] text-slate-400 mt-0.5">
            Classify your dispute category to open targeted legal fact-gathering.
          </p>
        </div>
        {selectedCategory && (
          <button
            onClick={handleReset}
            className="text-[11px] text-rose-600 hover:text-rose-700 font-bold transition flex items-center gap-1 cursor-pointer"
            type="button"
          >
            <RefreshCw className="h-3 w-3" />
            <span>Reset Category</span>
          </button>
        )}
      </div>

      <div className="space-y-4">
        {/* Category Search & Dropdown */}
        <div className="relative">
          <label className="text-[11px] font-mono uppercase tracking-wider text-slate-400 block mb-1">
            Search or Choose Case Type *
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
              <Search className="h-4 w-4" />
            </div>
            <input
              type="text"
              placeholder={selectedCategory ? selectedCategory.name : "Type to filter categories (e.g. Criminal, Family, Tax)..."}
              value={searchQuery}
              onClick={() => setDropdownOpen(true)}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setDropdownOpen(true);
              }}
              className="w-full rounded-lg border border-slate-200 pl-9 pr-8 py-2.5 text-xs font-semibold focus:border-amber-500 focus:outline-none transition"
              id="case-category-search-input"
            />
            <button
              type="button"
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 focus:outline-none cursor-pointer"
              id="case-category-dropdown-btn"
            >
              <ChevronDown className="h-4 w-4" />
            </button>
          </div>

          {/* Floating Dropdown Result Area */}
          {dropdownOpen && (
            <div className="absolute z-30 mt-1 w-full rounded-lg border border-slate-200 bg-white shadow-lg max-h-[220px] overflow-y-auto">
              <div className="p-1">
                {filteredCategories.length === 0 ? (
                  <div className="p-3 text-xs text-slate-400 text-center">
                    No matching categories found
                  </div>
                ) : (
                  filteredCategories.map((cat) => {
                    const isSelected = selectedCategory?.id === cat.id;
                    return (
                      <button
                        key={cat.id}
                        type="button"
                        onClick={() => handleSelectCategory(cat)}
                        className={`w-full text-left px-3 py-2 rounded-md text-xs font-medium flex items-center justify-between hover:bg-slate-50 transition cursor-pointer ${
                          isSelected ? "bg-amber-50/50 text-slate-900 border-l-2 border-amber-500" : "text-slate-600"
                        }`}
                      >
                        <div>
                          <p className="font-semibold text-slate-800">{cat.name}</p>
                          <p className="text-[10px] text-slate-400 truncate max-w-[280px]">
                            {cat.subcategories.join(", ")}
                          </p>
                        </div>
                        {isSelected && <Check className="h-3 w-3 text-amber-600 font-bold" />}
                      </button>
                    );
                  })
                )}
              </div>
            </div>
          )}
        </div>

        {/* Selected Category Presentation */}
        {selectedCategory && (
          <div className="animate-fade-in space-y-4">
            {/* Subcategory Dropdown */}
            <div>
              <label className="text-[11px] font-mono uppercase tracking-wider text-slate-400 block mb-1">
                Select Subcategory *
              </label>
              <div className="relative">
                <select
                  value={selectedSubcategory}
                  onChange={(e) => setSelectedSubcategory(e.target.value)}
                  className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-xs font-semibold focus:border-amber-500 focus:outline-none appearance-none transition"
                  id="case-subcategory-select"
                >
                  <option value="">-- Choose subcategory --</option>
                  {selectedCategory.subcategories.map((sub) => (
                    <option key={sub} value={sub}>
                      {sub}
                    </option>
                  ))}
                </select>
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-slate-400">
                  <ChevronDown className="h-4 w-4" />
                </div>
              </div>
            </div>

            {/* Dynamic Specific Questionnaire Block */}
            {selectedSubcategory && (
              <div className="bg-slate-50 rounded-xl p-4 border border-slate-150 space-y-3.5 animate-slide-up">
                <div className="flex items-center space-x-1.5 border-b border-slate-200/50 pb-2">
                  <HelpCircle className="h-4 w-4 text-amber-600" />
                  <span className="text-[10.5px] font-mono tracking-wider text-slate-500 block uppercase font-extrabold">
                    {selectedCategory.name} Questionnaire
                  </span>
                </div>

                <div className="grid grid-cols-1 gap-3">
                  {selectedCategory.fields.map((field) => {
                    const currentVal = questionnaireValues[field.id] ?? "";
                    
                    return (
                      <div key={field.id} className="space-y-1">
                        <label className="text-xs font-semibold text-slate-800 flex items-center">
                          {field.label}
                        </label>
                        
                        {field.type === "select" ? (
                          <div className="relative">
                            <select
                              value={currentVal}
                              onChange={(e) => handleFieldChange(field.id, e.target.value)}
                              className="w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-xs font-medium focus:border-amber-500 focus:outline-none appearance-none transition h-[36px]"
                            >
                              <option value="">-- Select option --</option>
                              {field.options?.map((opt) => (
                                <option key={opt} value={opt}>
                                  {opt}
                                </option>
                              ))}
                            </select>
                            <div className="absolute inset-y-0 right-0 pr-2.5 flex items-center pointer-events-none text-slate-400">
                              <ChevronDown className="h-3.5 w-3.5" />
                            </div>
                          </div>
                        ) : field.type === "number" ? (
                          <input
                            type="number"
                            placeholder={field.placeholder}
                            value={currentVal}
                            onChange={(e) => handleFieldChange(field.id, Number(e.target.value))}
                            className="w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-xs font-medium focus:border-amber-500 focus:outline-none transition h-[36px]"
                          />
                        ) : (
                          <input
                            type="text"
                            placeholder={field.placeholder}
                            value={currentVal}
                            onChange={(e) => handleFieldChange(field.id, e.target.value)}
                            className="w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-xs font-medium focus:border-amber-500 focus:outline-none transition h-[36px]"
                          />
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
