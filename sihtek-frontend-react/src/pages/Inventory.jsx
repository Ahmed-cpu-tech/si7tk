import { useCallback, useEffect, useState } from 'react'
import { Package, Pencil, Plus, Search, Trash2 } from 'lucide-react'
import { api, apiError } from '../api/client'
import { useLang } from '../context/LanguageContext'
import { EmptyState, formatMoney, Modal, PageLoader, Pagination, useToast } from '../components/ui'

const EMPTY = { name: '', category: '', price: '', stock_qty: '' }

export default function Inventory() {
  const { t } = useLang()
  const toast = useToast()
  const [q, setQ] = useState('')
  const [page, setPage] = useState(1)
  const [pharmacy, setPharmacy] = useState(null)
  const [medications, setMedications] = useState(null)
  const [loading, setLoading] = useState(true)
  const [modal, setModal] = useState(null) // 'create' | Medication object | null
  const [form, setForm] = useState({ ...EMPTY })
  const [busy, setBusy] = useState(false)

  const load = useCallback(() => {
    setLoading(true)
    api
      .get('/medications', { params: { q, page } })
      .then((r) => {
        setPharmacy(r.data.pharmacy)
        setMedications(r.data.medications)
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [q, page])

  useEffect(() => {
    load()
  }, [load])

  const openCreate = () => {
    setForm({ ...EMPTY })
    setModal('create')
  }

  const openEdit = (m) => {
    setForm({ name: m.name, category: m.category ?? '', price: String(m.price), stock_qty: String(m.stock_qty) })
    setModal(m)
  }

  const save = async () => {
    setBusy(true)
    try {
      const payload = {
        name: form.name,
        category: form.category || null,
        price: Number(form.price),
        stock_qty: Number(form.stock_qty),
      }
      if (modal === 'create') {
        await api.post('/medications', payload)
        toast(t('inventory.added', { name: form.name }))
      } else if (modal) {
        await api.patch(`/medications/${modal.id}`, payload)
        toast(t('inventory.updated'))
      }
      setModal(null)
      load()
    } catch (err) {
      toast(apiError(err, t), true)
    } finally {
      setBusy(false)
    }
  }

  const remove = async (m) => {
    if (!window.confirm(t('inventory.deleteConfirm', { name: m.name }))) return
    try {
      await api.delete(`/medications/${m.id}`)
      toast(t('inventory.deleted'))
      load()
    } catch (err) {
      toast(apiError(err, t), true)
    }
  }

  if (loading && !medications) return <PageLoader />

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">{t('inventory.title', { name: pharmacy?.name })}</h1>
          <p className="text-sm text-slate-500">{pharmacy?.address ?? ''} {pharmacy?.city}</p>
        </div>
        <button className="btn-primary" onClick={openCreate}>
          <Plus className="h-4 w-4" /> {t('inventory.add')}
        </button>
      </div>

      <div className="relative max-w-sm">
        <Search className="absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
        <input
          className="input ps-9"
          placeholder={t('inventory.searchPh')}
          value={q}
          onChange={(e) => { setQ(e.target.value); setPage(1) }}
        />
      </div>

      {medications?.data.length === 0 ? (
        <EmptyState icon={<Package className="h-12 w-12" />} title={t('inventory.empty')} subtitle={t('inventory.emptySub')} />
      ) : (
        <div className="card overflow-x-auto">
          <table className="w-full min-w-[640px] text-start text-sm">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                <th className="px-5 py-3 font-semibold">{t('inventory.thMed')}</th>
                <th className="px-5 py-3 font-semibold">{t('inventory.thCat')}</th>
                <th className="px-5 py-3 font-semibold">{t('inventory.thPrice')}</th>
                <th className="px-5 py-3 font-semibold">{t('inventory.thStock')}</th>
                <th className="px-5 py-3 font-semibold">{t('inventory.thSold')}</th>
                <th className="px-5 py-3" />
              </tr>
            </thead>
            <tbody>
              {medications?.data.map((m) => (
                <tr key={m.id} className="border-b border-slate-100 hover:bg-slate-50">
                  <td className="px-5 py-3.5 font-semibold text-slate-800">{m.name}</td>
                  <td className="px-5 py-3.5 text-slate-500">{m.category ?? '—'}</td>
                  <td className="px-5 py-3.5 font-medium text-slate-700">{formatMoney(m.price)}</td>
                  <td className="px-5 py-3.5">
                    <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-bold ${
                      m.stock_qty === 0 ? 'bg-red-100 text-red-700' : m.stock_qty <= 5 ? 'bg-amber-100 text-amber-700' : 'bg-emerald-100 text-emerald-700'
                    }`}>
                      {m.stock_qty === 0 ? t('inventory.outOfStock') : m.stock_qty}
                    </span>
                  </td>
                  <td className="px-5 py-3.5 text-slate-500">{m.sold_count}</td>
                  <td className="px-5 py-3.5">
                    <div className="flex justify-end gap-1">
                      <button className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-brand-700" onClick={() => openEdit(m)} title={t('common.edit')}>
                        <Pencil className="h-4 w-4" />
                      </button>
                      <button className="rounded-lg p-2 text-slate-400 hover:bg-red-50 hover:text-red-600" onClick={() => remove(m)} title={t('common.delete')}>
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {medications && <Pagination page={medications.current_page} lastPage={medications.last_page} onPage={setPage} />}

      {/* Create / edit modal */}
      <Modal
        open={!!modal}
        onClose={() => setModal(null)}
        title={modal === 'create' ? t('inventory.createTitle') : t('inventory.editTitle')}
      >
        <div className="space-y-4">
          <div>
            <label className="label">{t('inventory.name')}</label>
            <input className="input" value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} placeholder={t('inventory.namePh')} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">{t('inventory.category')}</label>
              <input className="input" value={form.category} onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))} placeholder={t('inventory.categoryPh')} />
            </div>
            <div>
              <label className="label">{t('inventory.price')}</label>
              <input className="input" type="number" min={0} step="0.5" dir="ltr" value={form.price} onChange={(e) => setForm((f) => ({ ...f, price: e.target.value }))} />
            </div>
          </div>
          <div>
            <label className="label">{t('inventory.stockQty')}</label>
            <input className="input" type="number" min={0} dir="ltr" value={form.stock_qty} onChange={(e) => setForm((f) => ({ ...f, stock_qty: e.target.value }))} />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button className="btn-secondary" onClick={() => setModal(null)}>{t('common.cancel')}</button>
            <button className="btn-primary" disabled={busy || !form.name || form.price === '' || form.stock_qty === ''} onClick={save}>
              {busy ? t('common.saving') : t('common.save')}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
