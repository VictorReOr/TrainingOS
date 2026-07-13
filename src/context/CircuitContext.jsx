import React, { createContext, useContext, useState, useEffect } from 'react';
import { saveTimerTemplate } from '../services/sheets';

const CircuitContext = createContext();

export function CircuitProvider({ children }) {
  const [circuitBlocks, setCircuitBlocks] = useState([]);
  const [circuitName, setCircuitName] = useState('Nuevo Circuito');
  
  const [executionStatus, setExecutionStatus] = useState('idle'); // 'idle' | 'running' | 'paused' | 'finished'
  const [currentBlockIndex, setCurrentBlockIndex] = useState(0);
  const [currentSet, setCurrentSet] = useState(1);

  const [savedTemplates, setSavedTemplates] = useState([]);

  useEffect(() => {
    const raw = localStorage.getItem('trainingos_timer_templates');
    if (raw) {
      try {
        setSavedTemplates(JSON.parse(raw));
      } catch (e) {
        console.error("Error parsing templates", e);
      }
    }
  }, []);

  const saveTemplate = (name) => {
    const newTemplate = {
      id: 'tpl_' + Date.now(),
      name: name || circuitName,
      blocks: [...circuitBlocks],
      createdAt: new Date().toISOString()
    };
    
    const updated = [newTemplate, ...savedTemplates].slice(0, 20); // max 20
    setSavedTemplates(updated);
    localStorage.setItem('trainingos_timer_templates', JSON.stringify(updated));

    // Opcional Sync
    Promise.resolve()
      .then(() => saveTimerTemplate(newTemplate))
      .then(() => console.log('[Sheets] saveTimerTemplate → ok'))
      .catch(err => console.warn('[Sheets] saveTimerTemplate falló:', err.message));
  };

  const loadTemplate = (template) => {
    setCircuitName(template.name);
    setCircuitBlocks(template.blocks);
    setExecutionStatus('idle');
  };

  const deleteTemplate = (id) => {
    const updated = savedTemplates.filter(t => t.id !== id);
    setSavedTemplates(updated);
    localStorage.setItem('trainingos_timer_templates', JSON.stringify(updated));
  };

  const initCircuit = (blocks, name = 'Circuito Custom') => {
    setCircuitBlocks(blocks);
    setCircuitName(name);
    setCurrentBlockIndex(0);
    setCurrentSet(1);
    setExecutionStatus('idle');
  };

  return (
    <CircuitContext.Provider value={{
      circuitBlocks, setCircuitBlocks,
      circuitName, setCircuitName,
      executionStatus, setExecutionStatus,
      currentBlockIndex, setCurrentBlockIndex,
      currentSet, setCurrentSet,
      savedTemplates,
      saveTemplate, loadTemplate, deleteTemplate,
      initCircuit
    }}>
      {children}
    </CircuitContext.Provider>
  );
}

export const useCircuit = () => useContext(CircuitContext);
