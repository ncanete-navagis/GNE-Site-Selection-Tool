import React from 'react';
import ScoreBar from '../../atoms/ScoreBar';
import Tag from '../../atoms/Tag';
import ComparisonSquare from '../../molecules/ComparisonSquare';

export const FeaturesPanelAnalysis = ({ poi }) => {
  if (!poi?.analysis) return null;

  return (
    <div style={{ padding: '0 20px 24px 20px' }}>
      <div style={{ fontSize: '12px', color: '#888', marginBottom: '12px', fontWeight: '500', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
        Scoring Breakdown
      </div>
      <div style={{ display: 'grid', gap: '12px' }}>
        {[
          { label: 'Overall Score', score: poi.analysis.overall_score, color: '#ff2a85' },
          { label: 'Foot Traffic', score: poi.analysis.foot_traffic_score, color: '#3291ff' },
          { label: 'Competition', score: poi.analysis.competing_business_score, color: '#00dc82' },
          { label: 'Flood Safety', score: poi.analysis.flood_hazard_score, color: '#f39c12' },
          { label: 'Landslide Safety', score: poi.analysis.landslide_hazard_score, color: '#e74c3c' },
        ].map((item, idx) => (
          <ScoreBar key={idx} {...item} />
        ))}
      </div>

      {/* Comparison Squares */}
      <div style={{
        marginTop: '24px',
        display: 'grid',
        gridTemplateColumns: 'repeat(2, 1fr)',
        gap: '10px'
      }}>
        <ComparisonSquare
          label="Population"
          required={poi.analysis.population ?? "N/A"}
          actual={poi.analysis.actual_population ?? 0}
          unit="ppl"
          isMeeting={poi.analysis.population ? (poi.analysis.actual_population >= poi.analysis.population) : null}
        />
        <ComparisonSquare
          label="Traffic Speed"
          required={poi.analysis.traffic_kmh ?? "N/A"}
          actual={poi.analysis.actual_traffic_kmh ?? 0}
          unit="km/h"
          isMeeting={poi.analysis.traffic_kmh ? (poi.analysis.actual_traffic_kmh >= poi.analysis.traffic_kmh) : null}
        />
        <ComparisonSquare
          label="Comm. Space"
          required="Any"
          actual={poi.analysis.commercial_space || 'No'}
          unit=""
          isMeeting={poi.analysis.commercial_space === 'Yes'}
        />
        <ComparisonSquare
          label="Lot Area"
          required={poi.analysis.lot_area ?? "N/A"}
          actual={poi.analysis.lot_area ?? 0}
          unit="Square Meters"
          isMeeting={true}
        />
      </div>

      {/* Sector Counts */}
      {poi.analysis.sector_counts && Object.keys(poi.analysis.sector_counts).length > 0 && (
        <div style={{ marginTop: '24px' }}>
          <div style={{ fontSize: '12px', color: '#888', marginBottom: '12px', fontWeight: '500', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Nearby Establishments
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px' }}>
            {Object.entries(poi.analysis.sector_counts).map(([sector, count]) => (
              <div key={sector} style={{
                background: 'rgba(255,255,255,0.03)',
                padding: '12px',
                borderRadius: '12px',
                border: '1px solid rgba(255,255,255,0.05)',
                display: 'flex',
                flexDirection: 'column',
                gap: '4px'
              }}>
                <div style={{ fontSize: '10px', color: '#888', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{sector}</div>
                <div style={{ fontSize: '18px', fontWeight: '800', color: '#FFF' }}>{count}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Pros & Cons */}
      <div style={{ marginTop: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {poi.analysis.pros?.length > 0 && (
          <div>
            <div style={{ fontSize: '11px', color: '#00dc82', fontWeight: '700', textTransform: 'uppercase', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <span>✓</span> Pros
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
              {poi.analysis.pros.map((pro, i) => (
                <Tag 
                  key={i} 
                  label={pro} 
                  color="#00dc82" 
                  backgroundColor="rgba(0, 220, 130, 0.1)" 
                  borderColor="rgba(0, 220, 130, 0.2)" 
                />
              ))}
            </div>
          </div>
        )}
        {poi.analysis.cons?.length > 0 && (
          <div>
            <div style={{ fontSize: '11px', color: '#ff4d4d', fontWeight: '700', textTransform: 'uppercase', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <span>!</span> Cons
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
              {poi.analysis.cons.map((con, i) => (
                <Tag 
                  key={i} 
                  label={con} 
                  color="#ff4d4d" 
                  backgroundColor="rgba(255, 77, 77, 0.1)" 
                  borderColor="rgba(255, 77, 77, 0.2)" 
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default FeaturesPanelAnalysis;
