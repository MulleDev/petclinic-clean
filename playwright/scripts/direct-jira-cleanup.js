const axios = require('axios');

/**
 * Script zum direkten Zugriff auf JIRA API für Ticket Management
 */

async function manageJiraTickets() {
  console.log('🔧 Direkter JIRA API Zugriff...\n');

  const jiraBaseUrl = 'http://localhost:8081';
  const auth = {
    username: 'admin',
    password: 'admin'
  };

  try {
    // Hole alle Tickets aus dem PET Projekt
    console.log('📋 Lade alle JIRA Tickets aus PET Projekt...');
    const searchUrl = `${jiraBaseUrl}/rest/api/2/search?jql=project=PET ORDER BY key ASC`;
    
    const response = await axios.get(searchUrl, { auth });
    
    if (response.data && response.data.issues) {
      const tickets = response.data.issues;
      console.log(`   Gefunden: ${tickets.length} Tickets\n`);

      // Zeige alle gefundenen Tickets
      console.log('🎫 Gefundene Tickets:');
      tickets.forEach((ticket, index) => {
        console.log(`   ${index + 1}. ${ticket.key}: ${ticket.fields.summary}`);
      });
      console.log();

      if (tickets.length <= 2) {
        console.log('✅ Nur 2 oder weniger Tickets vorhanden. Kein Cleanup nötig.');
        return;
      }

      // Behalte nur die ersten beiden Tickets
      const ticketsToKeep = tickets.slice(0, 2);
      const ticketsToDelete = tickets.slice(2);

      console.log('💾 Tickets die behalten werden:');
      ticketsToKeep.forEach(ticket => {
        console.log(`   ✅ ${ticket.key}: ${ticket.fields.summary}`);
      });
      console.log();

      console.log('🗑️  Tickets zum Löschen:');
      ticketsToDelete.forEach(ticket => {
        console.log(`   ❌ ${ticket.key}: ${ticket.fields.summary}`);
      });
      console.log();

      // Lösche die überflüssigen Tickets
      console.log('🗑️  Lösche überflüssige Tickets...');
      let deletedCount = 0;
      
      for (const ticket of ticketsToDelete) {
        try {
          const deleteUrl = `${jiraBaseUrl}/rest/api/2/issue/${ticket.key}`;
          await axios.delete(deleteUrl, { auth });
          console.log(`   ✅ Gelöscht: ${ticket.key}`);
          deletedCount++;
        } catch (error) {
          console.log(`   ❌ Fehler beim Löschen ${ticket.key}:`, error.response?.data?.errorMessages || error.message);
        }
      }

      console.log(`\n🎉 Cleanup abgeschlossen!`);
      console.log(`   Gelöscht: ${deletedCount} Tickets`);
      console.log(`   Behalten: ${ticketsToKeep.length} Tickets`);
      
    } else {
      console.log('❌ Keine Tickets gefunden.');
    }

  } catch (error) {
    console.error('❌ Fehler beim JIRA Zugriff:', error.response?.data?.errorMessages || error.message);
  }
}

// Script ausführen
manageJiraTickets().catch(console.error);
