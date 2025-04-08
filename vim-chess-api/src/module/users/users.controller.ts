import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  NotFoundException,
  UseGuards,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { ERROR } from '../../common/constants/error.constants';
import { UserEntity } from './entities/user.entity';
import { GetUser } from 'src/common/decorators/get-user.decorator';
import { OptionalJwtAuthGuard } from '../auth/strategy/jwt-auth.strategy';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  create(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }

  @Get()
  findAll() {
    return this.usersService.findAll();
  }

  @Get(':uid')
  @UseGuards(OptionalJwtAuthGuard)
  async findOne(@GetUser() user: UserEntity, @Param('uid') uid: string) {
    if (uid != 'me') {
      try {
        user = await this.usersService.findOne(uid);
      } catch (e) {
        throw new NotFoundException(ERROR.ResourceNotFound);
      }
    }
    if (!user && uid != 'me') {
      throw new NotFoundException(ERROR.ResourceNotFound);
    }
    return new UserEntity(user);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.usersService.update(+id, updateUserDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.usersService.remove(+id);
  }
}
