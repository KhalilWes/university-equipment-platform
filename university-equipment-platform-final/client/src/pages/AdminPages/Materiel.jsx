import { useState, useEffect, useCallback } from "react";
import toast from "react-hot-toast";

const MAINTENANCE_SUMMARY_API = "http://localhost:5000/api/maintenance/summary/open";

export default function Materiel() {
  const [equipment, setEquipment] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentId, setCurrentId] = useState(null);
  const [view, setView] = useState("inventory"); // "inventory" ou "trash"
  const [error, setError] = useState("");
  const [imageFile, setImageFile] = useState(null);
  const [maintenanceSummary, setMaintenanceSummary] = useState({});

  const [formData, setFormData] = useState({
    name: "",
    category: "electronics",
    serialNumber: "",
    condition: "Good",
    quantity: 1,
    description: "",
    emoji: "📦",
  });

  const fetchEquipment = useCallback(async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const endpoint = view === "inventory" ? "" : "/trash";
      const res = await fetch(`http://localhost:5000/api/equipment${endpoint}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) {
        setEquipment(data.data);

        if (view === "inventory") {
          const summaryRes = await fetch(MAINTENANCE_SUMMARY_API, {
            headers: { Authorization: `Bearer ${token}` },
          });
          const summaryData = await summaryRes.json();
          if (summaryRes.ok && summaryData.success) {
            const summaryMap = (summaryData.data || []).reduce((acc, item) => {
              acc[String(item._id)] = Number(item.quantityInMaintenance || 0);
              return acc;
            }, {});
            setMaintenanceSummary(summaryMap);
          } else {
            setMaintenanceSummary({});
          }
        } else {
          setMaintenanceSummary({});
        }
      }
    } catch (err) {
      console.error("Erreur chargement:", err);
    } finally {
      setLoading(false);
    }
  }, [view]);

  useEffect(() => {
    fetchEquipment();
  }, [fetchEquipment]);

  const handleDelete = async (id) => {
    if (!window.confirm("Voulez-vous vraiment supprimer cet équipement ?")) return;
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`http://localhost:5000/api/equipment/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) {
        toast.success("Équipement supprimé avec succès.");
        fetchEquipment();
      } else {
        toast.error(data.message || "Impossible de supprimer l'équipement.");
      }
    } catch (err) {
      console.error("Erreur suppression:", err);
      toast.error("Erreur serveur lors de la suppression.");
    }
  };

  const handleRestore = async (id) => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`http://localhost:5000/api/equipment/restore/${id}`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) {
        toast.success("Équipement restauré avec succès.");
        fetchEquipment();
      } else {
        toast.error(data.message || "Impossible de restaurer l'équipement.");
      }
    } catch (err) {
      console.error("Erreur restauration:", err);
      toast.error("Erreur serveur lors de la restauration.");
    }
  };

  const handleHardDelete = async (id) => {
    if (!window.confirm("ATTENTION : Cette action est irréversible. Supprimer définitivement cet article ?")) return;
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`http://localhost:5000/api/equipment/permanent/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) {
        toast.success("Équipement supprimé définitivement.");
        fetchEquipment();
      } else {
        toast.error(data.message || "Impossible de supprimer définitivement l'équipement.");
      }
    } catch (err) {
      console.error("Erreur suppression définitive:", err);
      toast.error("Erreur serveur lors de la suppression définitive.");
    }
  };

  const handleEmptyTrash = async () => {
    if (!window.confirm("Êtes-vous sûr de vouloir vider TOUTE la corbeille ? Tous les articles seront perdus à jamais.")) return;
    try {
      const token = localStorage.getItem("token");
      const res = await fetch("http://localhost:5000/api/equipment/empty-trash", {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) {
        toast.success("Corbeille vidée avec succès.");
        fetchEquipment();
      } else {
        toast.error(data.message || "Impossible de vider la corbeille.");
      }
    } catch (err) {
      console.error("Erreur vidage corbeille:", err);
      toast.error("Erreur serveur lors du vidage de la corbeille.");
    }
  };

  const handleOpenAdd = () => {
    setFormData({
      name: "",
      category: "electronics",
      serialNumber: "",
      condition: "Good",
      quantity: 1,
      description: "",
      emoji: "📦",
    });
    setIsEditing(false);
    setShowModal(true);
    setError("");
    setImageFile(null);
  };

  const handleOpenEdit = (item) => {
    setFormData({
      name: item.name,
      category: item.category,
      serialNumber: item.serialNumber,
      condition: item.condition,
      quantity: item.quantity,
      description: item.description || "",
      emoji: item.emoji || "📦",
    });
    setCurrentId(item._id);
    setIsEditing(true);
    setShowModal(true);
    setImageFile(null);
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!formData.name || !formData.serialNumber) {
      setError("Le nom et le numéro de série sont obligatoires.");
      return;
    }

    const method = isEditing ? "PUT" : "POST";
    const url = isEditing
      ? `http://localhost:5000/api/equipment/${currentId}`
      : "http://localhost:5000/api/equipment";

    // Utilisation de FormData pour permettre l'envoi de fichiers
    const uploadData = new FormData();
    Object.keys(formData).forEach(key => {
      uploadData.append(key, formData[key]);
    });
    
    if (imageFile) {
      uploadData.append("image", imageFile);
    }

    try {
      const token = localStorage.getItem("token");
      const res = await fetch(url, {
        method,
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: uploadData, // On envoie l'objet FormData directement
      });
      const result = await res.json();
      if (result.success) {
        setShowModal(false);
        fetchEquipment();
      } else {
        setError(result.error || result.message || "Une erreur est survenue");
      }
    } catch {
      setError("Erreur serveur");
    }
  };

  const normalizedSearch = search.toLowerCase();

  const displayedItems = view === "inventory"
    ? equipment.flatMap((item) => {
        const inMaintenanceQty = Number(maintenanceSummary[item._id] || 0);
        const availableQty = Number(item.quantity || 0);
        const rows = [];

        if (availableQty > 0 || inMaintenanceQty === 0) {
          rows.push({
            ...item,
            rowType: "available",
            rowId: `${item._id}-available`,
            displayCondition: item.condition || "Good",
            displayStatus: availableQty > 0 ? "Available" : "Out of Stock",
            displayQuantity: availableQty,
          });
        }

        if (inMaintenanceQty > 0) {
          rows.push({
            ...item,
            rowType: "maintenance",
            rowId: `${item._id}-maintenance`,
            displayCondition: "Under Maintenance",
            displayStatus: "Maintenance",
            displayQuantity: inMaintenanceQty,
          });
        }

        return rows;
      })
    : equipment;

  const filteredItems = displayedItems.filter((item) => {
    const name = String(item.name || "").toLowerCase();
    const serial = String(item.serialNumber || "").toLowerCase();
    return name.includes(normalizedSearch) || serial.includes(normalizedSearch);
  });

  return (
    <div style={{ padding: '20px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h2 style={{ margin: 0 }}>{view === "inventory" ? "Gestion du Stock" : "Corbeille / Archives"}</h2>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button 
            onClick={() => setView(view === "inventory" ? "trash" : "inventory")} 
            style={{ padding: '10px 20px', backgroundColor: '#6c757d', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' }}
          >
            {view === "inventory" ? "Voir la Corbeille" : "Retour à l'inventaire"}
          </button>
          {view === "trash" && equipment.length > 0 && (
            <button 
              onClick={handleEmptyTrash} 
              style={{ padding: '10px 20px', backgroundColor: '#343a40', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' }}
            >
              Vider la corbeille
            </button>
          )}
          {view === "inventory" && (
            <button onClick={handleOpenAdd} style={{ padding: '10px 20px', backgroundColor: '#28a745', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' }}>
              + Nouvel Équipement
            </button>
          )}
        </div>
      </div>

      <div style={{ marginBottom: '20px' }}>
        <input
          type="text"
          placeholder="Rechercher par nom ou numéro de série..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{ width: '100%', padding: '12px', borderRadius: '5px', border: '1px solid #ccc' }}
        />
      </div>

      {loading ? <p>Chargement des données...</p> : (
        <table style={{ width: '100%', borderCollapse: 'collapse', boxShadow: '0 2px 5px rgba(0,0,0,0.1)' }}>
          <thead>
            <tr style={{ backgroundColor: '#f4f4f4', textAlign: 'left' }}>
              <th style={{ padding: '12px', borderBottom: '1px solid #ddd' }}>Icon</th>
              <th style={{ padding: '12px', borderBottom: '1px solid #ddd' }}>Nom</th>
              <th style={{ padding: '12px', borderBottom: '1px solid #ddd' }}>S/N</th>
              <th style={{ padding: '12px', borderBottom: '1px solid #ddd' }}>Catégorie</th>
              <th style={{ padding: '12px', borderBottom: '1px solid #ddd' }}>État</th>
              <th style={{ padding: '12px', borderBottom: '1px solid #ddd' }}>Statut</th>
              <th style={{ padding: '12px', borderBottom: '1px solid #ddd' }}>{view === "inventory" ? "Qté" : "Supprimé le"}</th>
              <th style={{ padding: '12px', borderBottom: '1px solid #ddd', textAlign: 'center' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredItems.map((item) => (
              <tr key={item.rowId || item._id} style={{ borderBottom: '1px solid #eee' }}>
                <td style={{ padding: '12px' }}>
                  {item.imageUrl ? (
                    <img src={item.imageUrl} alt={item.name} style={{ width: '40px', height: '40px', objectFit: 'cover', borderRadius: '4px' }} />
                  ) : (
                    <span style={{ fontSize: '24px' }}>{item.emoji}</span>
                  )}
                </td>
                <td style={{ padding: '12px', fontWeight: 'bold' }}>{item.name}</td>
                <td style={{ padding: '12px', color: '#666' }}>{item.serialNumber}</td>
                <td style={{ padding: '12px' }}>{item.category}</td>
                <td style={{ padding: '12px' }}>{item.displayCondition || item.condition}</td>
                <td style={{ padding: '12px' }}>{item.displayStatus || item.status}</td>
                <td style={{ padding: '12px' }}>
                  {view === "inventory" ? (item.displayQuantity ?? item.quantity) : new Date(item.deletedAt).toLocaleDateString()}
                </td>
                <td style={{ padding: '12px', textAlign: 'center' }}>
                  {view === "inventory" ? (
                    item.rowType === "maintenance" ? (
                      <span style={{ color: '#0d9488', fontWeight: 600 }}>Géré via maintenance</span>
                    ) : (
                      <>
                        <button onClick={() => handleOpenEdit(item)} style={{ marginRight: '8px', padding: '6px 12px', backgroundColor: '#007bff', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>Modifier</button>
                        <button onClick={() => handleDelete(item._id)} style={{ padding: '6px 12px', backgroundColor: '#dc3545', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>Supprimer</button>
                      </>
                    )
                  ) : (
                    <>
                      <button onClick={() => handleRestore(item._id)} style={{ marginRight: '8px', padding: '6px 12px', backgroundColor: '#17a2b8', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>Restaurer</button>
                      <button onClick={() => handleHardDelete(item._id)} style={{ padding: '6px 12px', backgroundColor: '#343a40', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>Supprimer définitivement</button>
                    </>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {showModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.6)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 100 }}>
          <div style={{ backgroundColor: 'white', padding: '30px', borderRadius: '8px', width: '500px', boxShadow: '0 4px 15px rgba(0,0,0,0.3)' }}>
            <h3 style={{ marginTop: 0 }}>{isEditing ? "Modifier l'article" : "Ajouter un article"}</h3>
            <form onSubmit={handleSubmit}>
              <div style={{ marginBottom: '15px' }}>
                <label style={{ display: 'block', marginBottom: '5px' }}>Nom de l'équipement</label>
                <input type="text" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} style={{ width: '100%', padding: '8px', border: '1px solid #cbd5e1', borderRadius: '6px', boxSizing: 'border-box', backgroundColor: '#fff' }} required />
              </div>
              <div style={{ display: 'flex', gap: '15px', marginBottom: '15px' }}>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', marginBottom: '5px' }}>Numéro de Série</label>
                  <input type="text" value={formData.serialNumber} onChange={(e) => setFormData({...formData, serialNumber: e.target.value})} style={{ width: '100%', padding: '8px', border: '1px solid #cbd5e1', borderRadius: '6px', boxSizing: 'border-box', backgroundColor: '#fff' }} required />
                </div>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', marginBottom: '5px' }}>Catégorie</label>
                  <select value={formData.category} onChange={(e) => setFormData({...formData, category: e.target.value})} style={{ width: '100%', padding: '8px', border: '1px solid #cbd5e1', borderRadius: '6px', boxSizing: 'border-box', backgroundColor: '#fff' }}>
                    <option value="computers">Ordinateurs</option>
                    <option value="projectors">Projecteurs</option>
                    <option value="electronics">Électronique</option>
                    <option value="other">Autre</option>
                  </select>
                </div>
              </div>
              <div style={{ display: 'flex', gap: '15px', marginBottom: '15px' }}>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', marginBottom: '5px' }}>État</label>
                  <select value={formData.condition} onChange={(e) => setFormData({...formData, condition: e.target.value})} style={{ width: '100%', padding: '8px', border: '1px solid #cbd5e1', borderRadius: '6px', boxSizing: 'border-box', backgroundColor: '#fff' }}>
                    <option value="New">Neuf</option>
                    <option value="Good">Bon état</option>
                    <option value="Fair">Passable</option>
                    <option value="Poor">Mauvais état</option>
                  </select>
                </div>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', marginBottom: '5px' }}>Quantité</label>
                  <input type="number" min="0" value={formData.quantity} onChange={(e) => setFormData({...formData, quantity: parseInt(e.target.value)})} style={{ width: '100%', padding: '8px', border: '1px solid #cbd5e1', borderRadius: '6px', boxSizing: 'border-box', backgroundColor: '#fff' }} />
                </div>
              </div>
              <div style={{ display: 'flex', gap: '15px', marginBottom: '15px' }}>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', marginBottom: '5px' }}>Emoji (Optionnel)</label>
                  <input type="text" value={formData.emoji} onChange={(e) => setFormData({...formData, emoji: e.target.value})} style={{ width: '100%', padding: '8px', border: '1px solid #cbd5e1', borderRadius: '6px', boxSizing: 'border-box', backgroundColor: '#fff' }} />
                </div>
                <div style={{ flex: 2 }}>
                  <label style={{ display: 'block', marginBottom: '5px' }}>Photo de l'équipement</label>
                  <input type="file" accept="image/*" onChange={(e) => setImageFile(e.target.files[0])} style={{ width: '100%', padding: '8px', border: '1px solid #cbd5e1', borderRadius: '6px', boxSizing: 'border-box', backgroundColor: '#fff' }} />
                </div>
              </div>
              {error && <p style={{ color: 'red', fontSize: '14px' }}>{error}</p>}
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '20px' }}>
                <button type="button" onClick={() => setShowModal(false)} style={{ padding: '8px 16px', border: '1px solid #ccc', background: 'none', borderRadius: '4px', cursor: 'pointer' }}>Annuler</button>
                <button type="submit" style={{ padding: '8px 16px', backgroundColor: '#28a745', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>Enregistrer</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
