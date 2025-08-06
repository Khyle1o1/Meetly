const { AppDataSource } = require('./dist/config/database.config');
const { Package } = require('./dist/database/entities/package.entity');

async function checkPackages() {
  try {
    await AppDataSource.initialize();
    
    const packageRepository = AppDataSource.getRepository(Package);
    const packages = await packageRepository.find({
      relations: ['user']
    });
    
    console.log('Found packages:', packages.map(p => ({
      id: p.id,
      name: p.name,
      isActive: p.isActive,
      userId: p.user?.id
    })));
    
    await AppDataSource.destroy();
  } catch (error) {
    console.error('Error:', error);
  }
}

checkPackages(); 