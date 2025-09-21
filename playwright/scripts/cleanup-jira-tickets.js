const axios = require('axios');

/**
 * Script zum Löschen überschüssiger JIRA Tickets
 * Behält nur die ersten beiden Tickets (PET-1 und PET-2)
 */

async function cleanupJiraTickets() {
  console.log('🧹 JIRA Ticket Cleanup gestartet...\n');

  const mcpServerUrl = 'http://localhost:3000';
  
  try {
    // Hole alle Tickets aus dem PET Projekt
    console.log('📋 Lade alle JIRA Tickets...');
    const response = await axios.get(`${mcpServerUrl}/issues/PET`);

    if (response.data && response.data.issues) {
      const tickets = response.data.issues;
      console.log(`   Gefunden: ${tickets.length} Tickets\n`);

      // Zeige alle gefundenen Tickets
      console.log('🎫 Gefundene Tickets:');
      tickets.forEach((ticket, index) => {
        console.log(`   ${index + 1}. ${ticket.key}: ${ticket.fields.summary}`);
      });
      console.log();

      // Behalte nur die ersten beiden Tickets (PET-1 und PET-2)
      const ticketsToKeep = tickets.slice(0, 2);
      const ticketsToDelete = tickets.slice(2);

      if (ticketsToDelete.length === 0) {
        console.log('✅ Keine Tickets zum Löschen gefunden.');
        return;
      }

      console.log('🗑️  Tickets zum Löschen:');
      ticketsToDelete.forEach(ticket => {
        console.log(`   ❌ ${ticket.key}: ${ticket.fields.summary}`);
      });
      console.log();

      console.log('💾 Tickets die behalten werden:');
      ticketsToKeep.forEach(ticket => {
        console.log(`   ✅ ${ticket.key}: ${ticket.fields.summary}`);
      });
      console.log();

      // Lösche die überflüssigen Tickets
      console.log('🗑️  Lösche überflüssige Tickets...');
      let deletedCount = 0;
      
      for (const ticket of ticketsToDelete) {
        try {
          await axios.delete(`${mcpServerUrl}/issue/${ticket.key}`);
          console.log(`   ✅ Gelöscht: ${ticket.key}`);
          deletedCount++;
        } catch (error) {
          console.log(`   ❌ Fehler beim Löschen ${ticket.key}:`, error.message);
        }
      }

      console.log(`\n🎉 Cleanup abgeschlossen!`);
      console.log(`   Gelöscht: ${deletedCount} Tickets`);
      console.log(`   Behalten: ${ticketsToKeep.length} Tickets`);
      
    } else {
      console.log('❌ Keine Tickets gefunden oder Fehler beim Laden.');
    }

  } catch (error) {
    console.error('❌ Fehler beim Cleanup:', error.message);
    if (error.response && error.response.data) {
      console.error('Details:', error.response.data);
    }
  }
}

// Script ausführen
cleanupJiraTickets().catch(console.error);
