import axios from 'axios'
import { useEffect, useState } from 'react'
import type { FormEvent } from 'react'

import { api } from '../lib/api'
import type { ApiCollection, Category, MenuItem } from '../types/api'

interface MenuFormState {
  category_id: string
  name: string
  description: string
  price: string
  is_available: boolean
}

const initialState: MenuFormState = {
  category_id: '',
  name: '',
  description: '',
  price: '',
  is_available: true,
}

export function MenuManagementPage() {
  const [categories, setCategories] = useState<Category[]>([])
  const [menu, setMenu] = useState<MenuItem[]>([])
  const [form, setForm] = useState<MenuFormState>(initialState)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [editingItemId, setEditingItemId] = useState<number | null>(null)
  const [submitError, setSubmitError] = useState<string | null>(null)

  useEffect(() => {
    async function loadPageData() {
      const [categoriesResponse, menuResponse] = await Promise.all([
        api.get<ApiCollection<Category>>('/categories'),
        api.get<ApiCollection<MenuItem>>('/menu'),
      ])

      setCategories(categoriesResponse.data.data)
      setMenu(menuResponse.data.data)
    }

    void loadPageData()
  }, [])

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setSubmitError(null)

    if (!form.category_id.trim()) {
      setSubmitError('Choose a category.')
      return
    }
    if (!form.name.trim()) {
      setSubmitError('Enter a name.')
      return
    }
    if (form.price === '' || Number.isNaN(Number(form.price)) || Number(form.price) < 0) {
      setSubmitError('Enter a valid price.')
      return
    }

    const payload = new FormData()
    payload.append('category_id', form.category_id)
    payload.append('name', form.name.trim())
    payload.append('description', form.description)
    payload.append('price', form.price)
    // Laravel boolean rule only accepts true/false/0/1/'0'/'1' — not the string "true"
    payload.append('is_available', form.is_available ? '1' : '0')
    if (selectedFile) {
      payload.append('image', selectedFile)
    }

    try {
      const response = editingItemId
        ? await api.post<{ data: MenuItem }>(`/menu/${editingItemId}?_method=PUT`, payload, {
            headers: { 'Content-Type': 'multipart/form-data' },
          })
        : await api.post<{ data: MenuItem }>('/menu', payload, {
            headers: { 'Content-Type': 'multipart/form-data' },
          })

      setMenu((current) => {
        const nextItem = response.data.data
        const rest = current.filter((item) => item.id !== nextItem.id)
        return [nextItem, ...rest]
      })

      setForm(initialState)
      setSelectedFile(null)
      setEditingItemId(null)
    } catch (err) {
      if (axios.isAxiosError(err) && err.response?.status === 422) {
        const data = err.response.data as { errors?: Record<string, string[]>; message?: string }
        const first = data.errors ? Object.values(data.errors).flat()[0] : undefined
        setSubmitError(first ?? data.message ?? 'Validation failed.')
      } else {
        setSubmitError('Could not save the menu item.')
      }
    }
  }

  async function handleDelete(itemId: number) {
    await api.delete(`/menu/${itemId}`)
    setMenu((current) => current.filter((item) => item.id !== itemId))
  }

  function startEditing(item: MenuItem) {
    setEditingItemId(item.id)
    setForm({
      category_id: String(item.category_id),
      name: item.name,
      description: item.description ?? '',
      price: String(item.price),
      is_available: item.is_available,
    })
  }

  return (
    <div className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
      <form
        onSubmit={handleSubmit}
        className="rounded-xl border border-slate-700 bg-slate-900 p-5 shadow-sm"
      >
        <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-500">Back office</p>
        <h2 className="mt-2 text-2xl font-bold text-white">
          {editingItemId ? 'Edit menu item' : 'Create menu item'}
        </h2>

        {submitError ? (
          <div className="mt-4 rounded-lg border border-red-500/40 bg-red-950/50 px-4 py-3 text-sm text-red-100">
            {submitError}
          </div>
        ) : null}

        <div className="mt-6 grid gap-4">
          <label className="text-sm font-medium text-slate-300">
            Category
            <select
              value={form.category_id}
              onChange={(event) => setForm((current) => ({ ...current, category_id: event.target.value }))}
              className="mt-2 w-full rounded-lg border border-slate-600 bg-slate-800 px-4 py-3 text-white outline-none focus:border-orange-500"
            >
              <option value="">Choose a category</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </label>

          <label className="text-sm font-medium text-slate-300">
            Name
            <input
              value={form.name}
              onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))}
              className="mt-2 w-full rounded-lg border border-slate-600 bg-slate-800 px-4 py-3 text-white outline-none focus:border-orange-500"
            />
          </label>

          <label className="text-sm font-medium text-slate-300">
            Description
            <textarea
              rows={4}
              value={form.description}
              onChange={(event) => setForm((current) => ({ ...current, description: event.target.value }))}
              className="mt-2 w-full rounded-lg border border-slate-600 bg-slate-800 px-4 py-3 text-white outline-none focus:border-orange-500"
            />
          </label>

          <label className="text-sm font-medium text-slate-300">
            Price
            <input
              type="number"
              step="0.01"
              min="0"
              value={form.price}
              onChange={(event) => setForm((current) => ({ ...current, price: event.target.value }))}
              className="mt-2 w-full rounded-lg border border-slate-600 bg-slate-800 px-4 py-3 text-white outline-none focus:border-orange-500"
            />
          </label>

          <label className="text-sm font-medium text-slate-300">
            Image
            <input
              type="file"
              accept="image/*"
              onChange={(event) => setSelectedFile(event.target.files?.[0] ?? null)}
              className="mt-2 w-full rounded-lg border border-slate-600 bg-slate-800 px-4 py-3 text-slate-200"
            />
          </label>

          <label className="inline-flex items-center gap-3 rounded-lg border border-slate-600 bg-slate-800 px-4 py-3 text-sm text-slate-300">
            <input
              type="checkbox"
              checked={form.is_available}
              onChange={(event) =>
                setForm((current) => ({ ...current, is_available: event.target.checked }))
              }
            />
            Available for ordering
          </label>
        </div>

        <div className="mt-6 flex gap-3">
          <button
            type="submit"
            className="rounded-xl bg-orange-600 px-5 py-3 font-semibold text-white shadow-sm hover:bg-orange-500"
          >
            {editingItemId ? 'Save changes' : 'Add item'}
          </button>
          <button
            type="button"
            onClick={() => {
              setEditingItemId(null)
              setForm(initialState)
              setSelectedFile(null)
            }}
            className="rounded-xl border border-slate-600 bg-slate-800 px-5 py-3 font-semibold text-slate-200 hover:bg-slate-700"
          >
            Clear
          </button>
        </div>
      </form>

      <section className="space-y-4">
        {menu.map((item) => (
          <article
            key={item.id}
            className="rounded-xl border border-slate-700 bg-slate-900 p-5 shadow-sm"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">
                  {item.category?.name}
                </p>
                <h3 className="mt-1 text-xl font-semibold text-white">{item.name}</h3>
                <p className="mt-2 text-sm text-slate-400">{item.description}</p>
              </div>
              <span className="rounded-full border border-slate-600 bg-slate-800 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-slate-300">
                {item.is_available ? 'In stock' : 'Hidden'}
              </span>
            </div>

            <div className="mt-4 flex items-center justify-between">
              <span className="text-lg font-bold text-orange-400">${item.price.toFixed(2)}</span>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => startEditing(item)}
                  className="rounded-lg border border-slate-600 px-4 py-2 text-sm font-medium text-slate-200 hover:bg-slate-800"
                >
                  Edit
                </button>
                <button
                  type="button"
                  onClick={() => void handleDelete(item.id)}
                  className="rounded-lg border border-red-500/40 px-4 py-2 text-sm font-medium text-red-300 hover:bg-red-950/50"
                >
                  Delete
                </button>
              </div>
            </div>
          </article>
        ))}
      </section>
    </div>
  )
}
