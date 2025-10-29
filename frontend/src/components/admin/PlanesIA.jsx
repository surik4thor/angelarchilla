import React, { useState } from 'react';
import api from '../../api/apiClient.js';
import ReactMarkdown from 'react-markdown';

export default function PlanesIA() {
  return (
    <div className="admin-alert admin-alert-info">
      La propuesta de planes comerciales por IA no está disponible.<br />
      Consulta los planes existentes o contacta con soporte para nuevas estrategias.
    </div>
  );
}
